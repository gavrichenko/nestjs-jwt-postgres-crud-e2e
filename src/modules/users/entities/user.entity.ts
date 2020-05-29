import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @CreateDateColumn()
  created: Date;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @Column({
    nullable: true
  })
  firstName: string;

  @Column({
    nullable: true
  })
  lastName: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
