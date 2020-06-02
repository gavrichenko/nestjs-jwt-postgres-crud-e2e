import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaResponseDto } from './dto/idea-response.dto';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidationPipe } from '../../shared/validation.pipe';
import { IdeaCreateDto } from './dto/idea-create.dto';

@ApiTags('idea (testing CRUD)')
@Controller('idea')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @Get('ideas')
  @ApiOkResponse({ type: [IdeaResponseDto] })
  @ApiInternalServerErrorResponse()
  getIdeas(): Promise<IdeaResponseDto[]> {
    return this.ideaService.getIdeas();
  }

  @Get(':id')
  @ApiOkResponse({ type: IdeaResponseDto })
  @ApiNotFoundResponse({ description: 'Not Found' })
  getIdea(@Param('id') ideaId: string): Promise<IdeaResponseDto> {
    return this.ideaService.getIdea(ideaId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  @ApiBody({ type: IdeaCreateDto })
  @ApiOkResponse({ type: IdeaResponseDto })
  @ApiInternalServerErrorResponse()
  createIdea(@Body() data: IdeaCreateDto): Promise<IdeaResponseDto> {
    return this.ideaService.createIdea(data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  @ApiBody({ type: IdeaCreateDto })
  @ApiOkResponse({ type: IdeaResponseDto })
  @ApiInternalServerErrorResponse()
  @ApiNotFoundResponse({ description: 'Not Found' })
  updateIdea(@Param('id') ideaId: string, @Body() data: Partial<IdeaCreateDto>) {
    return this.ideaService.updateIdea(ideaId, data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  @ApiOkResponse({ type: () => ({ deleted: 'id' }) })
  @ApiInternalServerErrorResponse()
  @ApiNotFoundResponse({ description: 'Not Found' })
  removeIdea(@Param('id') ideaId: string): Promise<{ deleted: string }> {
    return this.ideaService.removeIdea(ideaId);
  }
}
