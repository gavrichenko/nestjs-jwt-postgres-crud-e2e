import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from '../../shared/entities/user.entity';
import { UsersRepository } from '../../shared/repositories/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UsersRepository])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
