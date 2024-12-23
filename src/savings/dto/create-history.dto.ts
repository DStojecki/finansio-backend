import { IsNumber, IsString } from 'class-validator'

export class CreateHistoryDto {
    @IsNumber()
    readonly amount: number 

    @IsString()
    readonly date: string
}
