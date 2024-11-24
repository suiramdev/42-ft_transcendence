import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userProviders } from './user.providers';
import { MysqlConfigModule } from 'src/config/database/mysql/config.module';

@Module({
  imports: [MysqlConfigModule],
  providers: [...userProviders, UserService],
  controllers: [UserController],
})
export class UserModule {
  constructor(private readonly userService: UserService) {}
}
