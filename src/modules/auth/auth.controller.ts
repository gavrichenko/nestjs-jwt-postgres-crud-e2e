import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  HttpCode,
  Body,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register-dto';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req) {
    console.log('user', req);
    return this.authService.login(req.user);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  @HttpCode(201)
  @ApiBody({ type: UserRegisterDto })
  @ApiResponse({ status: 201, description: 'created' })
  @ApiResponse({ status: 400, description: 'BAD_REQUEST' })
  async register(@Body() data: UserRegisterDto) {
    return this.userService.register(data);
  }
}
