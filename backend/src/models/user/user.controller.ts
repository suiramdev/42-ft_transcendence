import {
  Controller,
  Get,
  Body,
  Param,
  // UseGuards,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserEntity> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updates: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.userService.updateUser(id, updates);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
