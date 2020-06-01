import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdeaEntity } from './entities/idea.entity';
import { IdeaDto } from './dto/idea.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
  ) {}

  async showAll() {
    return await this.ideaRepository.find();
  }

  async create(data: IdeaDto) {
    const idea = await this.ideaRepository.create(data);
    await this.ideaRepository.save(idea);
    return idea;
  }

  async read(id: string) {
    const foundItem = await this.ideaRepository.findOne({ where: { id } });
    if (!foundItem) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return foundItem;
  }

  async update(id: string, data: Partial<IdeaDto>) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return await this.ideaRepository.save({ ...idea, ...data });
  }

  async destroy(id: string) {
    const foundItem = await this.ideaRepository.findOne({ where: { id } });
    if (!foundItem) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    await this.ideaRepository.delete({ id });
    return { deleted: true };
  }
}
