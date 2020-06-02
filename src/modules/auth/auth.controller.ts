import { Controller, Post, HttpCode, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ValidationPipe } from '../../shared/validation.pipe';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignInResponse } from './dto/sign-in-response';
import { UserEntity } from '../../shared/entities/user.entity';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @ApiOperation({ summary: 'user login via username or email' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: SignInResponse })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<SignInResponse> {
    const user: UserEntity = await this.authService.validateUser(dto);
    return this.authService.signIn(user, dto);
  }

  @Post('signup')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  @ApiOperation({ summary: 'register user' })
  @ApiBody({ type: CreateAccountDto })
  @ApiCreatedResponse({
    description: 'User Registration',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'User already exists' })
  async signUp(@Body() dto: CreateAccountDto) {
    return this.authService.signUp(dto);
  }
}
