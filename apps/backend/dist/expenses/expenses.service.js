"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const expense_entity_1 = require("./expense.entity");
const category_entity_1 = require("../categories/category.entity");
const sync_1 = require("csv-stringify/sync");
const sync_2 = require("csv-parse/sync");
let ExpensesService = class ExpensesService {
    constructor(expenseRepository, categoryRepository, dataSource) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.dataSource = dataSource;
    }
    async create(createExpenseDto) {
        const { categoryId, ...expenseData } = createExpenseDto;
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found`);
        }
        const expense = this.expenseRepository.create({
            ...expenseData,
            category,
            date: new Date(),
        });
        return this.expenseRepository.save(expense);
    }
    async findAll(filterDto) {
        const { from, to, categoryId } = filterDto;
        const where = {};
        if (from && to) {
            where.date = (0, typeorm_2.Between)(new Date(from), new Date(to));
        }
        else if (from) {
            where.date = (0, typeorm_2.MoreThanOrEqual)(new Date(from));
        }
        else if (to) {
            where.date = (0, typeorm_2.LessThanOrEqual)(new Date(to));
        }
        if (categoryId) {
            where.category = { id: parseInt(categoryId, 10) };
        }
        return this.expenseRepository.find({
            where,
            relations: ['category'],
        });
    }
    async exportExpenses() {
        const expenses = await this.findAll({});
        const data = expenses.map(expense => ({
            Data: expense.date.toLocaleDateString('pt-BR'),
            Categoria: expense.category.name,
            Valor: expense.amount,
        }));
        const columns = ['Data', 'Categoria', 'Valor'];
        return (0, sync_1.stringify)(data, { header: true, columns });
    }
    async importExpenses(csvContent) {
        await this.dataSource.transaction(async (transactionalEntityManager) => {
            const records = (0, sync_2.parse)(csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
            if (!records || records.length === 0) {
                throw new common_1.BadRequestException('CSV content is empty or invalid.');
            }
            const expensesToCreate = [];
            for (const record of records) {
                const dateStr = record['Data'];
                const categoryName = record['Categoria'];
                const amountStr = record['Valor'];
                if (!dateStr || !categoryName || !amountStr) {
                    throw new common_1.BadRequestException(`Missing data in row: Data="${dateStr}", Categoria="${categoryName}", Valor="${amountStr}"`);
                }
                const [day, month, year] = dateStr.split('/').map(Number);
                if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
                    throw new common_1.BadRequestException(`Invalid date format (DD/MM/YYYY) in row for date: ${dateStr}`);
                }
                const date = new Date(year, month - 1, day);
                if (isNaN(date.getTime())) {
                    throw new common_1.BadRequestException(`Invalid date: ${dateStr}`);
                }
                const amount = parseFloat(amountStr.replace(',', '.'));
                if (isNaN(amount) || amount <= 0) {
                    throw new common_1.BadRequestException(`Invalid amount in row for amount: ${amountStr}`);
                }
                let category = await transactionalEntityManager.findOne(category_entity_1.Category, { where: { name: categoryName } });
                if (!category) {
                    category = transactionalEntityManager.create(category_entity_1.Category, { name: categoryName });
                    await transactionalEntityManager.save(category);
                }
                const expense = transactionalEntityManager.create(expense_entity_1.Expense, {
                    date: date,
                    amount: amount,
                    category: category,
                });
                expensesToCreate.push(expense);
            }
            await transactionalEntityManager.save(expensesToCreate);
        });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map