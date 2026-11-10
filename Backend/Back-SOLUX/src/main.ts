import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const { port, apiPrefix, nodeEnv } = configureApp(app);

  await app.listen(port);
  Logger.log(
    `App running on http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
  if (nodeEnv !== 'production') {
    Logger.log(
      `Docs on http://localhost:${port}/${apiPrefix}/docs`,
      'Bootstrap',
    );
  }
}

await bootstrap();
