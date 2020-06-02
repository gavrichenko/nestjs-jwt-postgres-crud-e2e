import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, NotContains, Length, Matches, IsEmail } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    required: true,
    example: 'demo@demo.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    example: 'demo_user',
  })
  @IsNotEmpty()
  @Matches(/^[a-z0-9_.-]{3,17}$/, {
    message:
      "Username can only contain lowercase letters, numbers, '_', '-' and '.' with min 3 max 17 length",
  })
  username: string;

  @ApiProperty({
    required: true,
    example: 'demo123',
  })
  @IsNotEmpty()
  @NotContains(' ')
  @Length(6, 20)
  password: string;

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
