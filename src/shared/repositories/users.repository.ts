import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { appConfig } from '../../config';
import { CreateAccountDto } from '../../modules/auth/dto/create-account.dto';
import { getUnixTimestamp } from '../utils';
import { LogoutResponseDto } from '../../modules/auth/dto/logout-response.dto';

@EntityRepository(UserEntity)
export class UsersRepository extends Repository<UserEntity> {
  private readonly appConfig: ReturnType<typeof appConfig>;
  constructor() {
    super();
    this.appConfig = appConfig();
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<UserEntity> {
    try {
      const item: UserEntity = await this.findOneOrFail({
        where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });
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
      throw new UnauthorizedException('Please check your credentials');
    }
  }

  async triggerRefreshToken(query: string): Promise<string> {
    try {
      const user: UserEntity = await this.findOneOrFail({
        where: [{ username: query }, { email: query }],
      });
      const refreshTokenPayload = {
        user_id: user.id,
        username: user.username,
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

  async findUserByRefreshToken(refresh_token: string): Promise<UserEntity> {
    try {
      return await this.findOneOrFail({ where: { refresh_token } });
    } catch (e) {
      throw new NotFoundException('User could not found');
    }
  }

  async removeRefreshToken(user_id: string): Promise<LogoutResponseDto> {
    try {
      const user = await this.findOneOrFail({ where: { id: user_id } });
      await this.update(user.id, { refresh_token: null });
      return { success: true };
    } catch (e) {
      throw new NotFoundException('User could not found');
    }
  }
}
