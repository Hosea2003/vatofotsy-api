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
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginUseCase, RefreshTokenUseCase, LogoutUseCase, ValidateTokenUseCase } from '../../application/use-cases/auth.use-cases';
import { LoginDto, AuthTokenResponseDto, RefreshTokenDto, LogoutDto, ValidateTokenDto, TokenValidationResponseDto } from '../dto';
import { ErrorResponseDto } from '../../../user/presentation/dto/error-response.dto';
import { JWT_TOKEN_PORT } from '../../auth.tokens';
import type { JwtTokenPort } from '../../domain/ports/auth.ports';
import { Public } from '../../decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    @Inject(JWT_TOKEN_PORT)
    private readonly jwtTokenPort: JwtTokenPort,
  ) {}

  @Public()
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

  @Public()
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
      // Extract userId from the refresh token
      const payload = await this.jwtTokenPort.verify(refreshTokenDto.refreshToken);
      const userId = payload.userId || payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid refresh token: missing user ID');
      }

      const authToken = await this.refreshTokenUseCase.execute(
        refreshTokenDto.refreshToken,
        userId,
      );

      return new AuthTokenResponseDto({
        accessToken: authToken.accessToken,
        refreshToken: authToken.refreshToken,
        userId: authToken.userId,
        expiresAt: authToken.expiresAt,
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || 
          error.name === 'TokenExpiredError' ||
          error.message === 'Invalid refresh token' || 
          error.message === 'User not found or not verified' ||
          error.message?.includes('Invalid refresh token')) {
        throw new UnauthorizedException(error.message || 'Invalid or expired refresh token');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully logged out.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token.',
    type: ErrorResponseDto,
  })
  async logout(@Body() logoutDto: LogoutDto): Promise<void> {
    try {
      // Extract userId from the token (access token or refresh token)
      const payload = await this.jwtTokenPort.verify(logoutDto.token);
      const userId = payload.userId || payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      await this.logoutUseCase.execute(userId);
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || 
          error.name === 'TokenExpiredError' ||
          error.message?.includes('Invalid token')) {
        throw new UnauthorizedException(error.message || 'Invalid or expired token');
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Validate token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid.',
    type: TokenValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token.',
    type: ErrorResponseDto,
  })
  async validateToken(@Body() validateTokenDto: ValidateTokenDto): Promise<TokenValidationResponseDto> {
    try {
      const payload = await this.validateTokenUseCase.execute(validateTokenDto.token);
      
      return new TokenValidationResponseDto({
        valid: true,
        userId: payload.userId || payload.sub,
        expiresAt: new Date(payload.exp * 1000), // JWT exp is in seconds
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || 
          error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new BadRequestException(error.message);
    }
  }
}
