import 'reflect-metadata';
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { genSalt, hash } from 'bcrypt';

const USERS = [
    {
        email: 'daniel@gmail.com',
        password:  'testtesttest'
    },
    {
        email: 'kasia@gmail.com',
        password:  'testtesttest'
    },
]

export default class UserSeeder implements Seeder {
    constructor() {}

    public async run(
        dataSource: DataSource,
    ): Promise<any> {
        const repository = dataSource.getRepository(User);
        let count = 0

        for (const user of USERS) {
            try {
                const userInDatabase = await repository.findOneBy({
                    email: user.email,
                });
                
                if (userInDatabase) {
                    console.log(`User already exists: ${user.email}`);
                    continue;
                }

                const salt = await genSalt();
                const hashedPassword = await hash(user.password, salt);
                const entity = { password: hashedPassword, email: user.email };

                await repository.insert(entity);
                console.log(`Inserted user: ${user.email}`);
                count++;
            } catch (error) {
                console.error(`Error inserting user ${user.email}:`, error);
            }
        }
        console.log(`User seeding complete - ${count} new users added`);
    }   
}