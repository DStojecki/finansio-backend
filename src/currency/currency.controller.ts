import { Controller, Get, Param } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) {}

    @Get()
    findOne() {
        return this.currencyService.getCurrency();
    }
}

