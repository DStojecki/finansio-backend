import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saving } from './entities/saving.entity';
import { User } from 'src/users/entities/user.entity';
import { SavingOperation } from './entities/savingOperation';

@Module({
    imports: [TypeOrmModule.forFeature([User, Saving, SavingOperation])],
    controllers: [SavingsController],
    providers: [SavingsService],
})
export class SavingsModule {}
