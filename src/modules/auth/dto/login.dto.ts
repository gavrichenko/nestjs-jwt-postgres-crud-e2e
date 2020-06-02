import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, NotContains, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: false,
    example: 'demo@demo.com',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    example: 'demo_user',
  })
  @IsOptional()
  username: string;

  @ApiProperty({
    required: true,
    example: 'demo123',
  })
  @IsNotEmpty()
  @NotContains(' ')
  @Length(6, 20)
  password: string;
}
