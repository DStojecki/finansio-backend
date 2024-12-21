import { IsString } from 'class-validator'
import type { HistoryRecord}  from '../entities/saving.entity'


export class CreateSavingDto {
    @IsString()
    readonly name: string;

    @IsString()
    readonly currency: string;

    readonly history: HistoryRecord[]  
}
