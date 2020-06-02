import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { IdeaResponseDto } from '../../modules/idea/dto/idea-response.dto';

@Entity('ideas')
export class IdeaEntity {
  constructor(partial: Partial<IdeaEntity>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column('text')
  idea: string;

  @Column()
  description: string;

  toResponseObject(): IdeaResponseDto {
    return this;
  }
}
