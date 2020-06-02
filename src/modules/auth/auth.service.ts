import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../shared/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersRepository } from '../../shared/repositories/users.repository';
import { LoginDto } from './dto/login.dto';
import { SignInResponse } from './dto/sign-in-response';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async validateUser(dto: LoginDto): Promise<UserEntity> {
    return await this.usersRepository.validateUser(dto);
  }

  async signIn(userEntity: UserEntity, dto: LoginDto): Promise<SignInResponse> {
    if (!userEntity.is_active) throw new BadRequestException('Account is not active');

    const jwtPayload = {
      user_id: userEntity.id,
    };

    const access_token: string = this.jwtService.sign(jwtPayload);
    const refresh_token = await this.usersRepository.triggerRefreshToken(dto.username || dto.email);

    return {
      ...userEntity.toResponseObject(),
      access_token,
      refresh_token,
    };
  }

  async signUp(dto: CreateAccountDto): Promise<UserResponseDto> {
    const { username, email } = dto;
    const foundUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    if (foundUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const createdUser = await this.usersRepository.createUser(dto);
    return createdUser.toResponseObject();
  }
}
