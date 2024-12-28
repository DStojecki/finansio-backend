import { IsNumber, IsString } from 'class-validator'

export class CreateSavingDto {
    @IsString()
    readonly name: string;

    @IsString()
    readonly currency: string;

    @IsNumber()
    readonly amount: number;

}
