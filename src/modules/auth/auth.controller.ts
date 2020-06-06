import {
  Controller,
  Post,
  HttpCode,
  Body,
  UsePipes,
  Get,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { UserEntity } from '../../shared/entities/user.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @ApiOperation({ summary: 'user login via username or email' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: SignInResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<SignInResponseDto> {
    const user: UserEntity = await this.authService.validateUser(dto);
    return this.authService.signIn(user);
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

  @Post('refresh')
  @UsePipes(ValidationPipe)
  @HttpCode(201)
  @ApiOperation({ summary: 'issue token pair by refresh token' })
  @ApiBody({ type: RefreshDto })
  @ApiCreatedResponse({
    description: 'Refresh token pair',
    type: SignInResponseDto,
  })
  @ApiBadRequestResponse()
  async refreshTokenPair(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'logout' })
  @ApiCreatedResponse({ type: LogoutResponseDto })
  @ApiBadRequestResponse()
  async logout(@Request() req) {
    if (!req.user || !req.user.userId) {
      throw new NotFoundException('User could not found');
    }
    const { userId } = req.user;
    return this.authService.logout(userId);
  }

  @Get('test/jwt')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
