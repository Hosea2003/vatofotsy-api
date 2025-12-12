import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  
  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  // Setup Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vatofotsy API')
    .setDescription('The Vatofotsy API documentation')
    .setVersion('1.0')
    .addTag('vatofotsy')
    .build();
  const document = SwaggerModule.createDocument(app as any, swaggerConfig);
  SwaggerModule.setup('docs/api', app as any, document);

  console.log('API documentation available at /docs/api');
  
  const port = config.get<number>('PORT') || 3000;
  console.log("Server is running on port:", port);

  await app.listen(port);
}
bootstrap();
