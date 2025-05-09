import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { Saving } from '../savings/entities/saving.entity';
import { SavingOperation } from '../savings/entities/savingOperation';

config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
    type: 'postgres', 
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    seeds: ['src/database/seeders/**/*.{js,ts}'],
    entities: [User, Saving, SavingOperation]
};


export default new DataSource(dataSourceOptions)
