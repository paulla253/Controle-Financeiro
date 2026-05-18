import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiProduces,
} from '@nestjs/swagger';
import { CsvService } from './csv.service';

@ApiTags('csv')
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import expenses from CSV (RF-011..014)',
    description: `Upload a CSV file with expenses. All rows must be valid — any error aborts the entire import (RF-013).

**Format:**
- Encoding: UTF-8 (BOM optional — files exported from Excel may include BOM automatically)
- Delimiter: semicolon \`;\` (recommended for BR locale) or comma \`,\`
- Header row required: \`Data;Categoria;Valor\`
- Date format: DD/MM/AAAA (e.g. \`15/01/2024\`)
- Amount format: Brazilian Real — use comma as decimal separator (e.g. \`150,00\` or \`1.234,56\`)
- Max file size: 5 MB

**Example CSV (semicolon delimiter — recommended):**
\`\`\`
Data;Categoria;Valor
15/01/2024;Alimentação;150,00
28/02/2024;Transporte;1.234,56
01/03/2024;Assinaturas;29,90
\`\`\`

**Example CSV (comma delimiter — values with commas must be quoted):**
\`\`\`
Data,Categoria,Valor
15/01/2024,Alimentação,"150,00"
28/02/2024,Transporte,"1.234,56"
\`\`\`

**Automatic category creation:** if a category in the file does not exist, it is created automatically (RF-012).

**Possible errors (HTTP 400):**
- \`Line N: invalid date format "..."\` — date is not in DD/MM/AAAA format
- \`Line N: invalid date "..."\` — date is not a valid calendar date (e.g. 32/01/2024)
- \`Line N: invalid amount "..."\` — amount is not a positive number
- \`Line N: missing Data/Categoria/Valor column\` — required column is empty
- \`Failed to parse CSV file\` — file is not valid CSV`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file (max 5 MB). Encoding UTF-8, delimiter ; or ,',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Import successful — returns count of imported expenses',
    schema: { example: { imported: 3 } },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid file or CSV content — entire import is aborted, no data is persisted',
    schema: {
      example: {
        statusCode: 400,
        message: 'Line 3: invalid date format "32/01/2024"',
        error: 'Bad Request',
        details: { line: 3, reason: 'Date must be in DD/MM/AAAA format' },
      },
    },
  })
  async import(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imported: number }> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Send a CSV file in the "file" field.',
      );
    }
    return this.csvService.import(file.buffer);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export all expenses as CSV (RF-015)',
    description:
      'Returns a UTF-8 CSV file with BOM, columns: Data (DD/MM/AAAA), Categoria, Valor (BR format).',
  })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 200, description: 'CSV file download' })
  async export(@Res() res: Response): Promise<void> {
    const buffer = await this.csvService.export();
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="despesas.csv"');
    res.send(buffer);
  }
}
