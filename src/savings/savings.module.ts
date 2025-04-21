import { forwardRef, Module } from '@nestjs/common';
import { SavingsService } from './savings/savings.service';
import { SavingsController } from './savings/savings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saving } from './entities/saving.entity';
import { User } from '../users/entities/user.entity';
import { SavingOperation } from './entities/savingOperation';
import { SavingsOperationService } from './savings-operation/savings-operation.service';
import { SavingOperationController } from './savings-operation/savings-operation.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Saving, SavingOperation]), 
        forwardRef(() => SavingsModule)
    ],
    controllers: [SavingsController, SavingOperationController],
    providers: [SavingsService, SavingsOperationService],
})
export class SavingsModule {}
