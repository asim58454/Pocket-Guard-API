// src/expense/expense.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column('float')
  price: number;

  @Column()
  date: Date;

  @Column()
  day: string;

   @Column()
  category: string; // New field

  @ManyToOne(() => User, user => user.expenses, { onDelete: 'CASCADE' })
  user: User;
}
