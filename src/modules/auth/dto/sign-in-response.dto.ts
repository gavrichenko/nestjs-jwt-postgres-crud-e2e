import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignInResponseDto extends UserResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiPropertyOptional()
  refresh_token: string;
}
