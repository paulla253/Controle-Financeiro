import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentação' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
