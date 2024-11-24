import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
