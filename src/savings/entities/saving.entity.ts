import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SavingOperation } from './savingOperation';

export type HistoryRecord = {
    date: string
    amount: number
}
@Entity()
export class Saving {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.savings)
    user: User

    @OneToMany(() => SavingOperation, savingOperation=>savingOperation.saving)
    operations: SavingOperation[]
    
    @Column()
    name: string

    @Column({ type: 'jsonb', nullable: true })
    history: HistoryRecord[]

    @Column()
    currency: string
}
