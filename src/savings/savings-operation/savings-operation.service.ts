import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavingOperation } from '../entities/savingOperation';
import { Repository } from 'typeorm';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { SavingsService } from '../savings/savings.service';
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
import { Saving } from '../entities/saving.entity';

dayjs.extend(isBetween);

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
        const endDate = dayjs();
        const startDate = endDate.subtract(period - 1, 'month').startOf('month');

        const query = this.savingOperationRepository
            .createQueryBuilder('operation')
            .leftJoinAndSelect('operation.saving', 'saving')
            .leftJoin('saving.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('operation.created_at >= :startDate', { startDate: startDate.subtract(1, 'month').toDate() })
            .orderBy('operation.created_at', 'DESC');

        const operations = await query.getMany();

        // Get all unique saving IDs and their first operation dates
        const allSavingIds = [...new Set(operations.map(op => op.saving.id))];
        const firstOperationDates = new Map();
        operations.forEach(op => {
            const savingId = op.saving.id;
            if (!firstOperationDates.has(savingId) || 
                dayjs(op.created_at).isBefore(firstOperationDates.get(savingId))) {
                firstOperationDates.set(savingId, dayjs(op.created_at));
            }
        });
        
        const monthlyData = [];
        let lastKnownValues = new Map(); // Track last known value for each saving

        for (let i = 0; i < period; i++) {
            const currentMonth = endDate.subtract(i, 'month');
            const monthStart = currentMonth.startOf('month');
            const monthEnd = currentMonth.endOf('month');

            // Filter operations for current month
            const monthOperations = operations.filter(op => 
                dayjs(op.created_at).isBetween(monthStart, monthEnd, 'day', '[]')
            );

            // Get all operations up to the end of current month for historical values
            const operationsUpToMonth = operations.filter(op => 
                !dayjs(op.created_at).isAfter(monthEnd)
            );

            // Update last known values with valid operations
            operationsUpToMonth.forEach(op => {
                const savingId = op.saving.id;
                if (!lastKnownValues.has(savingId) || 
                    dayjs(op.created_at).isAfter(dayjs(lastKnownValues.get(savingId).created_at))) {
                    lastKnownValues.set(savingId, op);
                }
            });

            // For savings without operations this month, use their last known values
            // but only if we're after their first operation
            const monthResult = [];
            allSavingIds.forEach(savingId => {
                const firstOpDate = firstOperationDates.get(savingId);
                // Only include if we're in or after the month of the first operation
                if (firstOpDate && !monthStart.isBefore(firstOpDate.startOf('month'))) {
                    const currentOp = monthOperations.find(op => op.saving.id === savingId);
                    if (currentOp) {
                        monthResult.push(currentOp);
                    } else if (lastKnownValues.has(savingId)) {
                        monthResult.push(lastKnownValues.get(savingId));
                    }
                }
            });

            // Sort by created_at in descending order
            const sortedOperations = monthResult.sort((a, b) => 
                dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
            );

            monthlyData.unshift(sortedOperations);

            // Reset lastKnownValues for next iteration to avoid using future values
            lastKnownValues.clear();
        }

        return monthlyData;
    }
        
    private async getYearlyData(userId: number, period: number) {
        const endDate = dayjs();
        const startDate = endDate.subtract(period - 1, 'year').startOf('year');

        const query = this.savingOperationRepository
            .createQueryBuilder('operation')
            .leftJoinAndSelect('operation.saving', 'saving')
            .leftJoin('saving.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('operation.created_at >= :startDate', { startDate: startDate.subtract(1, 'year').toDate() })
            .orderBy('operation.created_at', 'DESC');

        const operations = await query.getMany();

        const yearlyData = [];
        for (let i = 0; i < period; i++) {
            const currentYear = endDate.subtract(i, 'year');
            const yearStart = currentYear.startOf('year');
            const yearEnd = currentYear.endOf('year');

            // Filter operations for current year
            const yearOperations = operations.filter(op => 
                dayjs(op.created_at).isBetween(yearStart, yearEnd, 'day', '[]')
            );

            // If no operations in current year, find the most recent operation before this year
            if (yearOperations.length === 0) {
                const previousOperations = operations.filter(op => 
                    dayjs(op.created_at).isBefore(yearStart)
                );
                
                if (previousOperations.length > 0) {
                    // Group by saving and get latest operation for each saving from previous operations
                    const savingMap = new Map();
                    previousOperations.forEach(op => {
                        const savingId = op.saving.id;
                        if (!savingMap.has(savingId) || dayjs(op.created_at).isAfter(dayjs(savingMap.get(savingId).created_at))) {
                            savingMap.set(savingId, op);
                        }
                    });
                    yearOperations.push(...savingMap.values());
                }
            }

            // Group by saving and get latest operation for each saving
            const savingMap = new Map();
            yearOperations.forEach(op => {
                const savingId = op.saving.id;
                if (!savingMap.has(savingId) || dayjs(op.created_at).isAfter(dayjs(savingMap.get(savingId).created_at))) {
                    savingMap.set(savingId, op);
                }
            });

            // Convert map values to array and sort by created_at in descending order
            const latestOperations = [...savingMap.values()].sort((a, b) => 
                dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()
            );

            yearlyData.unshift(latestOperations);
        }

        return yearlyData;
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
        await this.savingOperationRepository.remove(relatedOperations)
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
