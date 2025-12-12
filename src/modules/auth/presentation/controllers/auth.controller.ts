import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase } from '../../application/use-cases/auth.use-cases';
import { LoginDto, AuthTokenResponseDto, RefreshTokenDto } from '../dto';
import { ErrorResponseDto } from '../../../user/presentation/dto/error-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in.',
    type: AuthTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
    type: ErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    try {
      const authToken = await this.loginUseCase.execute(
        loginDto.email,
        loginDto.password,
      );

      return new AuthTokenResponseDto({
        accessToken: authToken.accessToken,
        refreshToken: authToken.refreshToken,
        userId: authToken.userId,
        expiresAt: authToken.expiresAt,
      });
    } catch (error) {
      if (error.message === 'Invalid credentials' || 
          error.message === 'User account is not verified') {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token successfully refreshed.',
    type: AuthTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token.',
    type: ErrorResponseDto,
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokenResponseDto> {
    try {
      // For now, we'll extract userId from the token. In a real app, you'd decode the refresh token
      // This is a simplified implementation
      const authToken = await this.refreshTokenUseCase.execute(
        refreshTokenDto.refreshToken,
        'temp-user-id', // This should be extracted from the token
      );

      return new AuthTokenResponseDto({
        accessToken: authToken.accessToken,
        refreshToken: authToken.refreshToken,
        userId: authToken.userId,
        expiresAt: authToken.expiresAt,
      });
    } catch (error) {
      if (error.message === 'Invalid refresh token' || 
          error.message === 'User not found or not verified') {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully logged out.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token.',
    type: ErrorResponseDto,
  })
  async logout(@Body() body: { userId: string }): Promise<void> {
    try {
      await this.logoutUseCase.execute(body.userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
