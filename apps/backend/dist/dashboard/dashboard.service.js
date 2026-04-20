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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const expense_entity_1 = require("../expenses/expense.entity");
let DashboardService = class DashboardService {
    constructor(expenseRepository) {
        this.expenseRepository = expenseRepository;
    }
    async getDashboardData(month, year) {
        const now = new Date();
        const targetMonth = month !== undefined ? month - 1 : now.getMonth();
        const targetYear = year || now.getFullYear();
        const firstDay = new Date(targetYear, targetMonth, 1);
        const lastDay = new Date(targetYear, targetMonth + 1, 0);
        const expenses = await this.expenseRepository.find({
            where: {
                date: (0, typeorm_2.Between)(firstDay, lastDay),
            },
            relations: ['category'],
        });
        const totalSpentThisMonth = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const spendingByCategoryMap = new Map();
        for (const expense of expenses) {
            if (!expense.category)
                continue;
            const categoryId = expense.category.id;
            if (!spendingByCategoryMap.has(categoryId)) {
                spendingByCategoryMap.set(categoryId, {
                    categoryId: categoryId,
                    categoryName: expense.category.name,
                    total: 0,
                });
            }
            const categorySpending = spendingByCategoryMap.get(categoryId);
            categorySpending.total += expense.amount;
        }
        const spendingByCategory = Array.from(spendingByCategoryMap.values());
        return {
            totalSpentThisMonth,
            spendingByCategory,
        };
    }
    async getAnnualSpending(year) {
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const annualSpending = [];
        for (let i = 0; i < 12; i++) {
            annualSpending.push({ month: monthNames[i], total: 0 });
        }
        const expenses = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('CAST(strftime("%m", expense.date) AS INTEGER)', 'month')
            .addSelect('SUM(expense.amount)', 'total')
            .where('CAST(strftime("%Y", expense.date) AS INTEGER) = :year', { year })
            .groupBy('month')
            .orderBy('month', 'ASC')
            .getRawMany();
        expenses.forEach((expense) => {
            const monthIndex = expense.month - 1;
            if (annualSpending[monthIndex]) {
                annualSpending[monthIndex].total = parseFloat(expense.total);
            }
        });
        return annualSpending;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map