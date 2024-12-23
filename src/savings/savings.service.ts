import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSavingDto } from './dto/create-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { CreateHistoryDto } from './dto/create-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Saving } from './entities/saving.entity';
import { Repository } from 'typeorm';
import { SavingOperation } from './entities/savingOperation';

@Injectable()
export class SavingsService {
    constructor(
        @InjectRepository(Saving)
        private readonly savingRepository: Repository<Saving>,
        @InjectRepository(SavingOperation)
        private readonly savingOperationRepository: Repository<SavingOperation>
    ) {}
        
    async create(createSavingDto: CreateSavingDto, user: number) {
        const saving = this.savingRepository.create({
            ...createSavingDto,
            user: {id: user},
        })

        const savedSaving = await this.savingRepository.save(saving);

        const savingOperation = this.savingOperationRepository.create({
            amount: createSavingDto.amount,
            saving: {id: savedSaving.id},
        }) 

        await this.savingOperationRepository.save(savingOperation)
        return savedSaving
    }

    findAll(user: number) {
        return this.savingRepository.find({
            where: {
                user: { id: user },
            },
            relations: ['user'], // Include if you need user details in the result
        });
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
            saving.history.push({
                date: new Date().toISOString().split('T')[0],
                amount: updateSavingDto.amount
            })
        }

        if (!saving) {
            throw new NotFoundException(`Saving ${id} not found`)
        }

        await this.savingRepository.save(saving)
        return await this.findAll(user)
    }

    async remove(id: number) {
        const saving = await this.findOne(id)

        this.savingRepository.remove(saving)
    }

    async createHistory(id: number, user: number, createHistoryDto: CreateHistoryDto) {
        const saving = await this.savingRepository.preload({id: +id})
        saving.history.push(createHistoryDto)
        
        saving.history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        await this.savingRepository.save(saving)
        
        return await this.findAll(user)
    }
}
