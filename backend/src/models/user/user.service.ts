import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<UserEntity | undefined> {
    const user = await this.userRepository.findOneBy({ id });
    return user ?? undefined;
  }

  async updateUser(
    id: string,
    updates: Partial<UserEntity>,
  ): Promise<UserEntity | undefined> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    return this.userRepository.save(updatedUser);
  }
}
