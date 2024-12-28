import { IsNumber, IsString } from 'class-validator'

export class CreateHistoryDto {
    @IsNumber()
    readonly amount: number 

    @IsString()
    readonly created_at: string
}
