import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDto } from '../users/dto/user-register-dto';
import { UserEntity } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginDto } from '../users/dto/user-login.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(data: UserLoginDto): Promise<UserResponseDto> {
    const { username, password } = data;
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new HttpException(
        `User with username '${username}' was not found`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }
    const jwtPayload = {
      username,
      sub: user.id,
    };
    return {
      ...user.toResponseObject(),
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: this.jwtService.sign(jwtPayload),
    };
  }

  async register(data: UserRegisterDto): Promise<UserResponseDto> {
    const { username } = data;
    const foundUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (foundUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    try {
      const user = await this.usersRepository.create(data);
      await this.usersRepository.save(user);
      return user.toResponseObject();
    } catch (e) {
      throw new HttpException(
        'INTERNAL_SERVER_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
