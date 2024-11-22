import { Module } from '@nestjs/common';
import { CoffesService } from './coffes.service';
import { CoffesController } from './coffes.controller';

@Module({
  controllers: [CoffesController],
  providers: [CoffesService],
})
export class CoffesModule {}
