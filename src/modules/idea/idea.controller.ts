import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDto } from './dto/idea.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from '../../shared/validation.pipe';

@ApiTags('idea (testing CRUD)')
@Controller('idea')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @Get()
  showAllIdeas() {
    return this.ideaService.showAll();
  }

  @Post()
  @UsePipes(ValidationPipe)
  @ApiBody({ type: IdeaDto })
  createIdea(@Body() data: IdeaDto) {
    return this.ideaService.create(data);
  }

  @Get(':id')
  readIdea(@Param('id') id: string) {
    return this.ideaService.read(id);
  }

  @Put(':id')
  @ApiBody({ type: IdeaDto })
  @UsePipes(ValidationPipe)
  updateIdea(@Param('id') id: string, @Body() data: Partial<IdeaDto>) {
    return this.ideaService.update(id, data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  destroyIdea(@Param('id') id: string) {
    return this.ideaService.destroy(id);
  }
}
