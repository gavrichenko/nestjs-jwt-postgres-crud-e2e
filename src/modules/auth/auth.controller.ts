import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  HttpCode,
  Body,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserLoginDto } from '../users/dto/user-login.dto';
import { UserRegisterDto } from '../users/dto/user-register-dto';
import { ValidationPipe } from '../../shared/validation.pipe';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @ApiBody({ type: UserLoginDto })
  @ApiOkResponse({ description: 'User Login', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() data: UserLoginDto) {
    return this.authService.login(data);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  @ApiBody({ type: UserRegisterDto })
  @ApiCreatedResponse({
    description: 'User Registration',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'User already exists' })
  async register(@Body() data: UserRegisterDto) {
    return this.authService.register(data);
  }
}
