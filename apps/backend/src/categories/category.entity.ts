import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @Column({ type: 'text', unique: true })
  @ApiProperty({ example: 'Alimentação' })
  @Expose()
  name: string;

  @CreateDateColumn()
  @ApiProperty()
  @Expose()
  createdAt: Date;
}
