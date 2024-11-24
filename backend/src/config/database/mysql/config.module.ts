import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseProviders } from './config.providers';
import Joi from 'joi';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        MYSQL_HOST: Joi.string().default('localhost'),
        MYSQL_PORT: Joi.number().default(3306),
        MYSQL_USERNAME: Joi.string().default('user'),
        MYSQL_PASSWORD: Joi.string().default('password'),
        MYSQL_DATABASE: Joi.string().default('ft_transcendence'),
      }),
      validationOptions: {
        // Stop validation on the first error, rather than aggregating all errors
        abortEarly: true,
      },
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class MysqlConfigModule {}
