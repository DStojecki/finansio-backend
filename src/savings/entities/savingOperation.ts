import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Saving } from './saving.entity';

@Entity()
export class SavingOperation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Saving, (saving) => saving.operations)
    saving: Saving;

    @Column()
    amount: number;

    @CreateDateColumn()
    created_at: Date;
}