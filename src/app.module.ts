import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffesModule } from './coffes/coffes.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { IamModule } from './iam/iam.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    CoffesModule, 
    UsersModule, 
    ConfigModule.forRoot(),
    IamModule,
    DatabaseModule
    ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
