import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { CreateSavingDto } from '../dto/create-saving.dto';
import { UpdateSavingDto } from '../dto/update-saving.dto';

@Controller('savings')
export class SavingsController {
    constructor(private readonly savingsService: SavingsService) {}

    @Post()
    create(
        @Body() createSavingDto: CreateSavingDto,
        @Headers('user') user: number
    ) {
        return this.savingsService.create(createSavingDto, user);
    }

    @Get()
    findAll(
        @Headers('user') user: number
    ) {
        return this.savingsService.findAll(user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.savingsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSavingDto: UpdateSavingDto, @Headers('user') user: number) {
        return this.savingsService.update(+id, user, updateSavingDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.savingsService.remove(+id);
    }
}
