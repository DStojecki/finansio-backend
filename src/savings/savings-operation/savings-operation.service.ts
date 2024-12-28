import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavingOperation } from '../entities/savingOperation';
import { Repository } from 'typeorm';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { SavingsService } from '../savings/savings.service';

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
