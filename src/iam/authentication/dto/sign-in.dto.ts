import { IsEmail, MinLength } from "class-validator"

export class SignInDto {
    // TODO Make sure validation object matches what frontend expecstes 
    @IsEmail()
    email: string

    @MinLength(8)
    password: string
}
