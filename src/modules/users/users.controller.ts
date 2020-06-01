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

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'get all users' })
  @ApiOkResponse({ type: [UserResponseDto] })
  @ApiInternalServerErrorResponse()
  showAllUsers() {
    return this.userService.showAll();
  }

  @Get(':username')
  @ApiOperation({ summary: 'get one user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  getOneUser(@Param('username') username: string) {
    return this.userService.findOne(username);
  }
}
