import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @ApiProperty({ example: 'Alimentação', minLength: 1, maxLength: 50 })
  name!: string;
}
