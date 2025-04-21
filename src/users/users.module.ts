import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Saving } from '../savings/entities/saving.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Saving])],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
