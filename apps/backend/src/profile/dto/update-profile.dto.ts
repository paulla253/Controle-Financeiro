import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Desenvolvedor' })
  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  monthlyIncome: number;
}
