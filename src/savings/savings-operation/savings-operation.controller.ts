import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { SavingsOperationService } from './savings-operation.service';
import { CreateHistoryDto } from '../dto/create-history.dto';

@Controller('savings-operation')
export class SavingOperationController {
    constructor(private readonly savingsOperationService: SavingsOperationService) {}

    @Get(':id')
    findAll(@Param('id') id: number) {
        return this.savingsOperationService.findAll(id);
    }

    @Get('period/:period')
    findInPeriod(@Param('period') period: number, @Headers('user') user: number) {
        return this.savingsOperationService.findInPeriod(period, user);
    }

    @Post(':id/history')
    createHistory(
        @Param('id') id: string,
        @Body() createHistoryDto: CreateHistoryDto,
        @Headers('user') user: number,
    ) {
        return this.savingsOperationService.createHistory(+id, user, createHistoryDto);
    }
}
