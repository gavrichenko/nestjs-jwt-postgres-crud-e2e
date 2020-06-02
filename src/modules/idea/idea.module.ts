import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';
import { IdeaEntity } from '../../shared/entities/idea.entity';
import { IdeasRepository } from '../../shared/repositories/ideas.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity, IdeasRepository])],
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}
