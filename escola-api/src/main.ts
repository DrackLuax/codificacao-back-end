import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, Logger} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true, 
    transform: true,
  }));

  //!Configuração do Swagger
  const config = new DocumentBuilder()
  .setTitle('API escolar')
  .setDescription('API para gerenciamente de alunos')
  .setVersion('1.0')
  .addTag('alunos')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  Logger.log(`Aplicação Rodando na porta: ${ await app.getUrl()}`,'boostrap');
}
await bootstrap();