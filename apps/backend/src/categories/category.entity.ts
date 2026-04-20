import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Category {
    @ApiProperty({ example: 1, description: 'The unique identifier of the category' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'Groceries', description: 'The name of the category' })
    @Column({ unique: true })
    name: string;
}
