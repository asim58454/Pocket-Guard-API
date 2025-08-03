import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Entity()
@Unique(['user', 'month', 'year'])
export class Saving {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: string;

  @Column()
  year: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => User, (user) => user.savings, { onDelete: 'CASCADE' })
  user: User;
}
