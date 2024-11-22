import { Injectable } from '@nestjs/common';
import { CreateCoffeDto } from './dto/create-coffe.dto';
import { UpdateCoffeDto } from './dto/update-coffe.dto';

@Injectable()
export class CoffesService {
  create(createCoffeDto: CreateCoffeDto) {
    return 'This action adds a new coffe';
  }

  findAll() {
    return `This action returns all coffes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coffe`;
  }

  update(id: number, updateCoffeDto: UpdateCoffeDto) {
    return `This action updates a #${id} coffe`;
  }

  remove(id: number) {
    return `This action removes a #${id} coffe`;
  }
}
