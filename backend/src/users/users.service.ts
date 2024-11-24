import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly entityManager: EntityManager) {}

  create(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);
    return this.entityManager.save(user);
  }

  findAll() {
    return this.entityManager.find(User);
  }

  findOne(id: number) {
    return this.entityManager.findOneBy(User, { id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.entityManager.update(User, id, updateUserDto);
  }

  remove(id: number) {
    return this.entityManager.delete(User, id);
  }
}
