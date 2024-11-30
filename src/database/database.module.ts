import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import UserSeeder from './seeders/user.seeder';

@Module({
    imports: [TypeOrmModule.forRoot(dataSourceOptions)],
    providers: [
        UserSeeder,
    ]
})
export class DatabaseModule {}
