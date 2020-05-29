import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRegisterDto } from '../auth/dto/user-register-dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {

  }

  async findOne(username: string): Promise<User> {
    const foundUser = await this.usersRepository.findOne({where: {username}});
    if(!foundUser) {
      throw new HttpException(`User ${username} was not found`, HttpStatus.NOT_FOUND);
    }
    return foundUser;
  }

  async showAll(): Promise<User[]>  {
    return await this.usersRepository.find();
  }

  async register(data: UserRegisterDto): Promise<User> {
    const { username } = data;
    let user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    user = await this.usersRepository.create(data);
    return await this.usersRepository.save(user);
  }
}
