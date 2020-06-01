import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(username: string): Promise<UserResponseDto> {
    const foundUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (!foundUser) {
      throw new HttpException(
        `User ${username} was not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return foundUser.toResponseObject();
  }

  async showAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersRepository.find();
      return users.map(user => user.toResponseObject());
    } catch (e) {
      throw new HttpException(
        'INTERNAL_SERVER_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
