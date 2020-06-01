import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRegisterDto } from '../auth/dto/user-register-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(username: string): Promise<UserEntity> {
    const foundUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (!foundUser) {
      throw new HttpException(
        `User ${username} was not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return foundUser;
  }

  async showAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async register(data: UserRegisterDto): Promise<UserEntity> {
    const { username } = data;
    let user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    user = await this.usersRepository.create(data);
    return await this.usersRepository.save(user);
  }
}
