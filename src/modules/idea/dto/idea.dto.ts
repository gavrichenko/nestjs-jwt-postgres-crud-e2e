import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdeaDto {
  @ApiProperty()
  @IsString()
  idea: string;

  @ApiProperty()
  @IsString()
  description: string;
}
