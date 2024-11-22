import { PartialType } from '@nestjs/mapped-types';
import { CreateCoffeDto } from './create-coffe.dto';

export class UpdateCoffeDto extends PartialType(CreateCoffeDto) {}
