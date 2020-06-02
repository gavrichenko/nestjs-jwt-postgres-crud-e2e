import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { IdeaEntity } from '../entities/idea.entity';
import { IdeaCreateDto } from '../../modules/idea/dto/idea-create.dto';

@EntityRepository(IdeaEntity)
export class IdeasRepository extends Repository<IdeaEntity> {
  constructor() {
    super();
  }

  async getIdea(id: string): Promise<IdeaEntity> {
    try {
      const item: IdeaEntity = await this.findOneOrFail({ id });
      return item;
    } catch (err) {
      throw new NotFoundException('Idea could not found');
    }
  }

  async getIdeas(): Promise<IdeaEntity[]> {
    try {
      const items: IdeaEntity[] = await this.find();
      return items;
    } catch (e) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createIdea(dto: IdeaCreateDto): Promise<IdeaEntity> {
    const newIdea: IdeaEntity = new IdeaEntity({
      description: dto.description,
      idea: dto.idea,
    });
    try {
      return await this.save(newIdea);
    } catch (e) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateIdea(id: string, data: Partial<IdeaCreateDto>): Promise<IdeaEntity> {
    const foundIdea = await this.findOne({ where: { id } });
    if (!foundIdea) {
      throw new NotFoundException('Idea could not found');
    }
    try {
      const updatedIdea: IdeaEntity = new IdeaEntity({
        ...foundIdea,
        ...data,
      });
      return await this.save(updatedIdea);
    } catch (e) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeIdea(id: string): Promise<string> {
    const idea = await this.findOne({ where: { id } });
    if (!idea) {
      throw new NotFoundException('Idea could not found');
    }
    try {
      await this.delete(id);
      return id;
    } catch (e) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
