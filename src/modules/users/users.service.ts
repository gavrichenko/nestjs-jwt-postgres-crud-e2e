import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersRepository } from '../../shared/repositories/users.repository';
import { UserEntity } from '../../shared/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async getUser(username: string): Promise<UserResponseDto> {
    const user: UserEntity = await this.usersRepository.getUserByUsername(username);
    return user.toResponseObject();
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users: UserEntity[] = await this.usersRepository.getUsers();
    return users.map(user => user.toResponseObject());
  }
}
