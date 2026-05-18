import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Category } from '../categories/category.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @Column({ type: 'text' })
  @ApiProperty({ example: '2024-01-15', description: 'ISO date YYYY-MM-DD' })
  @Expose()
  date: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ example: 150.5 })
  @Expose()
  amount: number;

  @Column()
  @ApiProperty({ example: 1 })
  @Expose()
  categoryId: number;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'categoryId' })
  @Expose()
  @Type(() => Category)
  category: Category;

  @CreateDateColumn()
  @ApiProperty()
  @Expose()
  createdAt: Date;
}
