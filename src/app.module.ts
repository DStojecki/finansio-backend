import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffesModule } from './coffes/coffes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CoffesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
