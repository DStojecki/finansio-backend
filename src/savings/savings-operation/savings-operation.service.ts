import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavingOperation } from '../entities/savingOperation';
import { Repository } from 'typeorm';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { SavingsService } from '../savings/savings.service';
import * as dayjs from 'dayjs';
import { Saving } from '../entities/saving.entity';
@Injectable()
export class SavingsOperationService {
    constructor(
        @InjectRepository(SavingOperation)
        private readonly savingOperationRepository: Repository<SavingOperation>,
        @Inject(forwardRef(() => SavingsService))
        private readonly savingsService: SavingsService,
    ) {}

    async findAll(id:number) {
        const savingOperations = await this.savingOperationRepository.find({
            where: {
                saving: { id: id },
            },
            order: { created_at: 'DESC' },
        });

        return savingOperations
    }

    async findInPeriod(period:number, user: number) {
        if (period <= 12) {
            return this.getMonthlyData(user, period);
          } else {
            return this.getYearlyData(user, period);
          }
    }
    private async getMonthlyData(userId: number, period: number) {

    }
        
    private async getYearlyData(userId: number, period: number) {
        
    }

    async create(amount:number, id:number) {
        const savingOperation = this.savingOperationRepository.create({
            amount: amount,
            saving: {id: id},
        }) 

        await this.savingOperationRepository.save(savingOperation)
    }

    async removeReletedOperations(id:number) {
        const relatedOperations = await this.findAll(id)

        relatedOperations.forEach(operation => {
            this.savingOperationRepository.remove(operation)
        })
    }

    async getLastTwoOperations(id) {
        const latestOperations = await this.savingOperationRepository.find({
            where: { saving: { id: id } },
            order: { created_at: 'DESC' },
            take: 2,
        });

        return latestOperations
    } 
    
    async createHistory(id: number, user: number, createHistoryDto: CreateHistoryDto) {
        const saving = await this.savingOperationRepository.create({
            ...createHistoryDto,
            saving: {id: id},
        })
        await this.savingOperationRepository.save(saving)
        
        return await this.savingsService.findAll(user)
    }
}
