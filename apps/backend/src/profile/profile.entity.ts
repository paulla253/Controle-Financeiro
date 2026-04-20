import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Profile {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the profile',
  })
  @PrimaryGeneratedColumn()
  id: number; // Always will be 1 for the single user

  @ApiProperty({
    example: 'Software Engineer',
    description: 'The job title of the user',
  })
  @Column({ default: '' })
  jobTitle: string;

  @ApiProperty({ example: 7000, description: 'The monthly income of the user' })
  @Column({ type: 'float', default: 0 })
  monthlyIncome: number;
}
