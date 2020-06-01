import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'get all users' })
  @ApiResponse({ status: 200, description: 'OK', type: [UserResponseDto] })
  showAllUsers() {
    return this.userService.showAll();
  }

  @Get(':username')
  @ApiOperation({ summary: 'get one user' })
  @ApiResponse({ status: 200, description: 'OK', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  getOneUser(@Param('username') username: string) {
    return this.userService.findOne(username);
  }
}
