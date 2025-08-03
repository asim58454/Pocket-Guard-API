import { Budget } from 'src/budget/budget.entity';
import { Expense } from 'src/expense/expense.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Saving } from 'src/saving/saving.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @OneToMany(() => Expense, expense => expense.user)
  expenses: Expense[];

  @OneToMany(() => Budget, (budget) => budget.user)
budgets: Budget[];

@OneToMany(() => Saving, (saving) => saving.user)
savings: Saving[];
}
