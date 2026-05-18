import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CsvService } from './csv.service';
import { Category } from '../categories/category.entity';
import { Expense } from '../expenses/expense.entity';

const BOM = '﻿';

function makeCsvBuffer(content: string, withBom = false): Buffer {
  return Buffer.from((withBom ? BOM : '') + content, 'utf-8');
}

const mockExpenseRepo = {
  createQueryBuilder: jest.fn(),
};

const mockCategoryRepo = {
  createQueryBuilder: jest.fn(),
};

const mockExpenseRepoManager = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockCategoryRepoManager = {
  createQueryBuilder: jest.fn(),
};

const mockManager = {
  getRepository: jest.fn((entity) => {
    if (entity === Category) return mockCategoryRepoManager;
    if (entity === Expense) return mockExpenseRepoManager;
    return {};
  }),
};

const mockDataSource = {
  transaction: jest.fn(),
};

describe('CsvService', () => {
  let service: CsvService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvService,
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: getRepositoryToken(Expense), useValue: mockExpenseRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CsvService>(CsvService);
  });

  describe('import', () => {
    function setupTransactionMock(
      existingCategory: { id: number; name: string } | null = {
        id: 1,
        name: 'Alimentação',
      },
    ) {
      mockDataSource.transaction.mockImplementation(
        async (cb: (m: typeof mockManager) => Promise<unknown>) => {
          const insertQb = {
            insert: jest.fn().mockReturnThis(),
            into: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            orIgnore: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({}),
          };
          const findQb = {
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(existingCategory),
          };
          mockCategoryRepoManager.createQueryBuilder
            .mockReturnValueOnce(insertQb)
            .mockReturnValueOnce(findQb);
          mockExpenseRepoManager.create.mockImplementation(
            (dto: object) => dto,
          );
          mockExpenseRepoManager.save.mockResolvedValue({});
          return cb(mockManager);
        },
      );
    }

    it('happy path: imports rows with comma delimiter', async () => {
      setupTransactionMock({ id: 1, name: 'Alimentação' });
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,150.00\n15/06/2024,Alimentação,200.50',
      );
      const result = await service.import(csv);
      expect(result).toEqual({ imported: 2 });
    });

    it('happy path: imports rows with semicolon delimiter', async () => {
      setupTransactionMock({ id: 1, name: 'Transporte' });
      const csv = makeCsvBuffer(
        'Data;Categoria;Valor\n10/03/2024;Transporte;99,90',
      );
      const result = await service.import(csv);
      expect(result).toEqual({ imported: 1 });
    });

    it('happy path: accepts BOM UTF-8', async () => {
      setupTransactionMock({ id: 2, name: 'Lazer' });
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n25/12/2024,Lazer,500.00',
        true,
      );
      const result = await service.import(csv);
      expect(result).toEqual({ imported: 1 });
    });

    it('returns { imported: 0 } for empty CSV (header only)', async () => {
      const csv = makeCsvBuffer('Data,Categoria,Valor\n');
      const result = await service.import(csv);
      expect(result).toEqual({ imported: 0 });
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('creates category automatically when it does not exist', async () => {
      setupTransactionMock({ id: 5, name: 'Nova Categoria' });
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Nova Categoria,10.00',
      );
      await service.import(csv);
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it('throws BadRequestException with line info for invalid date format (first line)', async () => {
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n32/01/2024,Alimentação,100.00',
      );
      await expect(service.import(csv)).rejects.toThrow(BadRequestException);
      try {
        await service.import(csv);
      } catch (e: any) {
        expect(e.response.line).toBe(2);
        expect(e.response.reason).toMatch(/date/i);
      }
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException with line info for invalid date format (middle line)', async () => {
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,100.00\nBadDate,Alimentação,200.00\n10/05/2024,Alimentação,50.00',
      );
      try {
        await service.import(csv);
        fail('Expected BadRequestException');
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response.line).toBe(3);
      }
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException with line info for invalid date format (last line)', async () => {
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,100.00\n10/05/2024,Alimentação,50.00\nBAD,Alimentação,50.00',
      );
      try {
        await service.import(csv);
        fail('Expected BadRequestException');
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response.line).toBe(4);
      }
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for invalid amount (zero)', async () => {
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,0.00',
      );
      try {
        await service.import(csv);
        fail('Expected BadRequestException');
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response.line).toBe(2);
        expect(e.response.reason).toMatch(/amount/i);
      }
    });

    it('throws BadRequestException for negative amount', async () => {
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,-50.00',
      );
      await expect(service.import(csv)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for missing Categoria column', async () => {
      const csv = makeCsvBuffer('Data,Categoria,Valor\n01/01/2024,,100.00');
      try {
        await service.import(csv);
        fail('Expected BadRequestException');
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.response.line).toBe(2);
      }
    });

    it('does NOT call transaction when any line is invalid (rollback assurance)', async () => {
      const csv = makeCsvBuffer(
        'Data,Categoria,Valor\n01/01/2024,Alimentação,100.00\nINVALID,,not-a-number',
      );
      await expect(service.import(csv)).rejects.toThrow(BadRequestException);
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('export', () => {
    it('returns buffer starting with BOM bytes', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            date: '2024-01-15',
            amount: 150.5,
            category: { name: 'Alimentação' },
          },
        ]),
      };
      mockExpenseRepo.createQueryBuilder.mockReturnValue(mockQb);

      const buffer = await service.export();

      expect(buffer[0]).toBe(0xef);
      expect(buffer[1]).toBe(0xbb);
      expect(buffer[2]).toBe(0xbf);
    });

    it('returns correct pt-BR formatted date and amount', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            date: '2024-06-15',
            amount: 1234.56,
            category: { name: 'Transporte' },
          },
        ]),
      };
      mockExpenseRepo.createQueryBuilder.mockReturnValue(mockQb);

      const buffer = await service.export();
      const content = buffer.toString('utf-8').replace('﻿', '');

      expect(content).toContain('15/06/2024');
      expect(content).toContain('Transporte');
      expect(content).toContain('1.234,56');
    });

    it('returns empty CSV with header when no expenses', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockExpenseRepo.createQueryBuilder.mockReturnValue(mockQb);

      const buffer = await service.export();
      const content = buffer.toString('utf-8').replace('﻿', '');

      expect(content).toContain('Data');
      expect(content).toContain('Categoria');
      expect(content).toContain('Valor');
    });
  });
});
