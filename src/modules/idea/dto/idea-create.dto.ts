import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdeaCreateDto {
  @ApiProperty()
  @IsString()
  idea: string;

  @ApiProperty()
  @IsString()
  description: string;
}
