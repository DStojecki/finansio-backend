import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSavingDto } from './dto/create-saving.dto';
import { UpdateSavingDto } from './dto/update-saving.dto';
import { CreateHistoryDto } from './dto/create-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Saving } from './entities/saving.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SavingsService {
    constructor(
        @InjectRepository(Saving)
        private readonly savingRepository: Repository<Saving>,
    ) {}
        
    create(createSavingDto: CreateSavingDto, user: number) {
        const saving = this.savingRepository.create({
            ...createSavingDto,
            user: {id: user},
        }) 

        return this.savingRepository.save(saving)
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
                date: new Date(),
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
        return 'Works good'
    }
}
