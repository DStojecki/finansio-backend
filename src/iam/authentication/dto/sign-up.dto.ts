import { IsEmail, MinLength , IsOptional, IsJSON } from 'class-validator';

export class SignUpDto {
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

    @IsOptional()
    data: JSON;
}
