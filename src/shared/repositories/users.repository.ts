import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> {
  constructor() {
    super();
  }

  async getUserByUsername(username: string): Promise<UserEntity> {
    try {
      const item: UserEntity = await this.findOneOrFail({ username });
      return item;
    } catch (err) {
      throw new NotFoundException('User could not found');
    }
  }

  async getUsers(): Promise<UserEntity[]> {
    try {
      const items: UserEntity[] = await this.find();
      return items;
    } catch (e) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
