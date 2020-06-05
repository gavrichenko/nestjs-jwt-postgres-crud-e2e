import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('users')
  @ApiOperation({ summary: 'get users' })
  @ApiOkResponse({ type: [UserResponseDto] })
  @ApiInternalServerErrorResponse()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':username')
  @ApiOperation({ summary: 'get user by username or email' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  getUser(@Param('username') usernameOrEmail: string): Promise<UserResponseDto> {
    return this.usersService.getUser(usernameOrEmail);
  }
}
