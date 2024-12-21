import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { IamModule } from './iam/iam.module';
import { DatabaseModule } from './database/database.module';
import { SavingsModule } from './savings/savings.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule, 
    IamModule,
    DatabaseModule,
    SavingsModule,
    CurrencyModule
    ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
