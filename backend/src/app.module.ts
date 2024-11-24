import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/app/config.module';
import { MysqlConfigModule } from './config/database/mysql/config.module';
import { UserModule } from './models/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppConfigModule,
    MysqlConfigModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
