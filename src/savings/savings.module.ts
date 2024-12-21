import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saving } from './entities/saving.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Saving, User])],
    controllers: [SavingsController],
    providers: [SavingsService],
})
export class SavingsModule {}
