import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaEntity } from '../../shared/entities/idea.entity';
import { IdeasRepository } from '../../shared/repositories/ideas.repository';
import { IdeaResponseDto } from './dto/idea-response.dto';
import { IdeaCreateDto } from './dto/idea-create.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeasRepository)
    private readonly ideasRepository: IdeasRepository,
  ) {}

  async getIdeas(): Promise<IdeaResponseDto[]> {
    const items: IdeaEntity[] = await this.ideasRepository.getIdeas();
    return items.map(item => item.toResponseObject());
  }

  async getIdea(id: string): Promise<IdeaResponseDto> {
    const item: IdeaEntity = await this.ideasRepository.getIdea(id);
    return item.toResponseObject();
  }

  async createIdea(data: IdeaCreateDto): Promise<IdeaResponseDto> {
    const item: IdeaEntity = await this.ideasRepository.createIdea(data);
    return item.toResponseObject();
  }

  async updateIdea(id: string, data: Partial<IdeaCreateDto>): Promise<IdeaResponseDto> {
    const item: IdeaEntity = await this.ideasRepository.updateIdea(id, data);
    return item.toResponseObject();
  }

  async removeIdea(id: string): Promise<{ deleted: string }> {
    const itemId: string = await this.ideasRepository.removeIdea(id);
    return { deleted: itemId };
  }
}
