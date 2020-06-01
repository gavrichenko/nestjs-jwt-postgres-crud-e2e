import { ApiProperty } from '@nestjs/swagger';

export class IdeaDto {
  @ApiProperty()
  idea: string;

  @ApiProperty()
  description: string;
}
