import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from '../../modules/users/dto/user-response.dto';

@Entity('users')
export class UserEntity {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  refresh_token: string;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column('text')
  password: string;

  @Column('int')
  role: number;

  @Column('boolean')
  is_active: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  firstName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  lastName: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeInsert()
  fillDefaults() {
    this.role = 0;
    this.is_active = true;
  }

  toResponseObject(): UserResponseDto {
    const { id, created_at, username, firstName, lastName, email } = this;
    return {
      id,
      created_at,
      username,
      email,
      firstName,
      lastName,
    };
  }
}
