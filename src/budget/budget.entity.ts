// src/budget/budget.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Entity()
@Unique(['user', 'month', 'year'])
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: number; // 0 (Jan) to 11 (Dec)

  @Column()
  year: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  user: User;
}
