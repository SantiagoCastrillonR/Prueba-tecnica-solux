import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SessionService } from '@modules/auth/application/services/session.service.js';
import { AUTH_COOKIE } from '@modules/auth/infrastructure/http/auth-cookie.js';
import { SocketAuthAdapter } from '@modules/auth/infrastructure/ws/socket-auth.adapter.js';

export interface AppSettings {
  port: number;
  apiPrefix: string;
  nodeEnv: string;
}

export function configureApp(app: INestApplication): AppSettings {
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);
  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  const nodeEnv = config.get<string>('NODE_ENV', 'development');

  const corsOrigins = config
    .get<string>('CORS_ORIGIN')
    ?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.setGlobalPrefix(apiPrefix, { exclude: ['health'] });
  app.use(helmet());
  app.use(cookieParser());
  if (corsOrigins?.length) {
    app.enableCors({ origin: corsOrigins, credentials: true });
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useWebSocketAdapter(
    new SocketAuthAdapter(
      app,
      app.get(SessionService),
      corsOrigins?.length ? corsOrigins : undefined,
    ),
  );

  app.enableShutdownHooks();

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Solux Chat API')
      .setDescription('REST API of the SOLUX real-time chat')
      .setVersion('0.1')
      .addCookieAuth(AUTH_COOKIE)
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  return { port, apiPrefix, nodeEnv };
}
