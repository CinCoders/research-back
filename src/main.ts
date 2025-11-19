import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AppDataSource } from './app.datasource';
import { AllExceptionsFilter } from './utils/exception-filters/catch-everything';

async function bootstrap() {
  let options = {};
  if (process.env.NODE_ENV === 'production') {
    const httpsOptions: {
      key?: Buffer | null;
      cert?: Buffer | null;
      ca?: Buffer | null;
    } = {};

    httpsOptions.key = fs.readFileSync(path.join(__dirname, '..', './certs/certificate.key'));
    httpsOptions.cert = fs.readFileSync(path.join(__dirname, '..', './certs/certificate.crt'));
    const caCertificatePath = path.join(__dirname, '..', './certs/intermediate.pem');
    if (fs.existsSync(caCertificatePath)) {
      httpsOptions.ca = fs.readFileSync(caCertificatePath);
    }
    options = { ...options, httpsOptions };
  }

  const app = await NestFactory.create(AppModule, options);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  
  app.setGlobalPrefix('/research/api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Research Dashboard API')
    .setDescription('The Research Dashboard API')
    .setVersion('0.1')
    .addOAuth2({
      type: 'oauth2',
      description: '<strong>Login</strong>',
      flows: {
        password: {
          authorizationUrl: process.env.AUTH_URL,
          tokenUrl: process.env.TOKEN_URL,
          scopes: {},
        },
      },
    })
    .build();

  await AppDataSource.initialize()
    .then(() => console.log('LOG [Typeorm] Success connection'))
    .catch(error => console.log(error));

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/research/api/swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      oauth2RedirectUrl: `${process.env.REDIRECT_URL}/research/api/`,
      oauth: {
        clientId: process.env.CLIENT_ID,
      },
    },
  });

  app.enableCors({
    origin: process.env.SERVER_URL,
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
