import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export type HistoryRecord = {
    date: Date
    amount: number
}

@Entity()
export class Saving {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.savings)
    user: User

    @Column()
    name: string

    @Column({ type: 'jsonb', nullable: true })
    history: HistoryRecord[]

    @Column()
    currency: string

}
