import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { appConfig } from '../../config';
import { CreateAccountDto } from '../../modules/auth/dto/create-account.dto';
import { getUnixTimestamp } from '../utils';

@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> {
  private readonly appConfig: ReturnType<typeof appConfig>;
  constructor() {
    super();
    this.appConfig = appConfig();
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
      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }

  async createUser(dto: CreateAccountDto): Promise<UserEntity> {
    const { username, email, password, firstName, lastName } = dto;
    const newUser: UserEntity = new UserEntity({
      username,
      email,
      password,
      firstName,
      lastName,
    });
    try {
      return await this.save(newUser);
    } catch (e) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUser(dto: LoginDto): Promise<UserEntity> {
    try {
      const foundUser = await this.findOneOrFail({
        where: [{ username: dto.username }, { email: dto.email }],
      });

      const isPasswordCorrect = await bcrypt.compare(dto.password, foundUser.password);
      if (isPasswordCorrect) {
        return foundUser;
      }
      throw new Error();
    } catch (err) {
      throw new BadRequestException('Please check your credentials');
    }
  }

  async triggerRefreshToken(query: string): Promise<string> {
    try {
      const user: UserEntity = await this.findOneOrFail({
        where: [{ username: query }, { email: query }],
      });
      const refreshTokenPayload = {
        user_id: user.id,
        sub: 'auth',
        iat: getUnixTimestamp(),
        exp: getUnixTimestamp() + getUnixTimestamp(this.appConfig.jwt.refreshTokenExpiresIn),
      };
      const refresh_token = jwt.sign(refreshTokenPayload, this.appConfig.jwt.secret_refresh);
      await this.update(user.id, { refresh_token });

      return refresh_token;
    } catch (e) {
      throw new InternalServerErrorException('INTERNAL_SERVER_ERROR');
    }
  }
}
