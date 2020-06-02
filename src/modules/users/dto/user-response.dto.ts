import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  username: string;

  @ApiProperty({
    required: true,
    example: 'email@mail.com',
  })
  email: string;

  @ApiProperty({
    required: false,
    example: 'John',
  })
  firstName?: string;

  @ApiProperty({
    required: false,
    example: 'Smith',
  })
  lastName?: string;
}
