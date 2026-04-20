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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const expenses_service_1 = require("./expenses.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const filter_expense_dto_1 = require("./dto/filter-expense.dto");
const expense_entity_1 = require("./expense.entity");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
let ExpensesController = class ExpensesController {
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    create(createExpenseDto) {
        return this.expensesService.create(createExpenseDto);
    }
    findAll(filterDto) {
        return this.expensesService.findAll(filterDto);
    }
    async export(res) {
        const csv = await this.expensesService.exportExpenses();
        res.status(common_1.HttpStatus.OK).send(csv);
    }
    async import(file) {
        try {
            const csvContent = file.buffer.toString('utf-8');
            await this.expensesService.importExpenses(csvContent);
            return { message: 'Expenses imported successfully.' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw new common_1.BadRequestException(`CSV Import Error: ${error.message}`);
            }
            throw error;
        }
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new expense' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The expense has been successfully created.', type: expense_entity_1.Expense }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input.' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List expenses with optional filtering by date range and category' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, type: String, example: '2024-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, type: String, example: '2024-12-31' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return filtered expenses.', type: [expense_entity_1.Expense] }),
    __param(0, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true, whitelist: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_expense_dto_1.FilterExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="expenses.csv"'),
    (0, swagger_1.ApiOperation)({ summary: 'Export all expenses to a CSV file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'CSV file with all expenses.', type: String }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "export", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Import expenses from a CSV file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expenses have been successfully imported.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid CSV file or content.' }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
            new common_1.FileTypeValidator({ fileType: 'text/csv' }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "import", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, swagger_1.ApiTags)('expenses'),
    (0, common_1.Controller)('api/expenses'),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map