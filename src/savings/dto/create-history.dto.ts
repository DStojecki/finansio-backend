import { IsDate, IsNumber } from 'class-validator'


export class CreateHistoryDto {
    @IsNumber()
    readonly amount: number 

    @IsDate()
    readonly date: Date
}
