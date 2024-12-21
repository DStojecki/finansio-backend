import { Saving } from 'src/savings/entities/saving.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany  } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(type => Saving, savings=>savings.user)
  savings: Saving[]
}