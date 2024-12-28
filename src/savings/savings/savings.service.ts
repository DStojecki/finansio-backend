import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSavingDto } from '../dto/create-saving.dto';
import { UpdateSavingDto } from '../dto/update-saving.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Saving } from '../entities/saving.entity';
import { Repository } from 'typeorm';
import { calculatePercentageChange } from 'src/utils/utils';
import { SavingsOperationService } from '../savings-operation/savings-operation.service';

@Injectable()
export class SavingsService {
    constructor(
        private savingOperationService: SavingsOperationService,
        @InjectRepository(Saving)
        private readonly savingRepository: Repository<Saving>,
    ) {}
        
    async create(createSavingDto: CreateSavingDto, user: number) {
        const saving = this.savingRepository.create({
            ...createSavingDto,
            user: {id: user},
        })

        const savedSaving = await this.savingRepository.save(saving);

        await this.savingOperationService.create(createSavingDto.amount, savedSaving.id)

        return savedSaving
    }
    

    async findAll(user: number) {
        let all = await this.savingRepository.find({
            where: {
                user: { id: user },
            },
            relations: ['user'],
        });

        all = await Promise.all(
            all.map(async (one) => {
                const latestOperations = await this.savingOperationService.getLastTwoOperations(one.id)
                let percentageChange = null
                
                if(latestOperations.length === 2) {
                    percentageChange = calculatePercentageChange(latestOperations[1].amount, latestOperations[0].amount)
                }
                return {
                    ...one,
                    amount: latestOperations[0].amount, 
                    lastUpdate: latestOperations[0].created_at,
                    percentageChange: percentageChange
                };
            }),
        );
        return all
    }

    async findOne(id: number) {
        const saving = await this.savingRepository.findOne({
            where: { id: +id },
        })

        if(!saving) {
            throw new NotFoundException(`Saving #${id} not found`)
        }

        return saving
    }

    async update(id: number, user: number, updateSavingDto: UpdateSavingDto) {
        const saving = await this.savingRepository.preload({
            id: +id,
            ...updateSavingDto,
        })

        if(updateSavingDto.amount) {
            await this.savingOperationService.create(updateSavingDto.amount, id)
        }

        if (!saving) {
            throw new NotFoundException(`Saving ${id} not found`)
        }

        await this.savingRepository.save(saving)
        return await this.findAll(user)
    }

    async remove(id: number) {
        const saving = await this.findOne(id)

        await this.savingOperationService.removeReletedOperations(id)
        this.savingRepository.remove(saving)
    }
}
