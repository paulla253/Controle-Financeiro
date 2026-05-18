import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';

const mockCsvService = {
  import: jest.fn(),
  export: jest.fn(),
};

describe('CsvController', () => {
  let controller: CsvController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvController],
      providers: [{ provide: CsvService, useValue: mockCsvService }],
    }).compile();

    controller = module.get<CsvController>(CsvController);
  });

  describe('import', () => {
    it('calls csvService.import with file buffer and returns result', async () => {
      const mockFile = {
        buffer: Buffer.from('csv content'),
        originalname: 'test.csv',
      } as Express.Multer.File;
      mockCsvService.import.mockResolvedValue({ imported: 3 });

      const result = await controller.import(mockFile);

      expect(mockCsvService.import).toHaveBeenCalledWith(mockFile.buffer);
      expect(result).toEqual({ imported: 3 });
    });

    it('throws BadRequestException when no file is provided', async () => {
      await expect(
        controller.import(undefined as unknown as Express.Multer.File),
      ).rejects.toThrow(BadRequestException);
      expect(mockCsvService.import).not.toHaveBeenCalled();
    });

    it('propagates BadRequestException from service (invalid CSV line)', async () => {
      const mockFile = {
        buffer: Buffer.from('bad csv'),
        originalname: 'bad.csv',
      } as Express.Multer.File;
      mockCsvService.import.mockRejectedValue(
        new BadRequestException({
          message: 'Line 2: invalid date',
          line: 2,
          reason: 'bad date',
        }),
      );

      await expect(controller.import(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('export', () => {
    it('sets Content-Type and Content-Disposition and sends buffer', async () => {
      const buffer = Buffer.from('\xef\xbb\xbfData,Categoria,Valor\n');
      mockCsvService.export.mockResolvedValue(buffer);

      const mockRes = {
        set: jest.fn(),
        send: jest.fn(),
      };

      await controller.export(mockRes as unknown as import('express').Response);

      expect(mockCsvService.export).toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
      expect(mockRes.set).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="despesas.csv"',
      );
      expect(mockRes.send).toHaveBeenCalledWith(buffer);
    });
  });
});
