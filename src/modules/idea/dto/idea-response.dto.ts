import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdeaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  created: Date;

  @ApiProperty()
  @IsString()
  idea: string;

  @ApiProperty()
  @IsString()
  description: string;
}
