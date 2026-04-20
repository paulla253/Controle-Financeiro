import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../categories/category.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Expense {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the expense',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Coffee',
    description: 'The description of the expense',
  })
  @Column()
  description: string;

  @ApiProperty({ example: 4.5, description: 'The amount of the expense' })
  @Column({ type: 'float' })
  amount: number;

  @ApiProperty({
    example: '2024-07-20T10:00:00.000Z',
    description: 'The date of the expense',
  })
  @Column()
  date: Date;

  @ApiProperty({ type: () => Category })
  @ManyToOne(() => Category, { eager: true })
  category: Category;
}
