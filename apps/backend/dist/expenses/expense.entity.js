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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("../categories/category.entity");
const swagger_1 = require("@nestjs/swagger");
let Expense = class Expense {
};
exports.Expense = Expense;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'The unique identifier of the expense',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Expense.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Coffee',
        description: 'The description of the expense',
    }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Expense.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.5, description: 'The amount of the expense' }),
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], Expense.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-07-20T10:00:00.000Z',
        description: 'The date of the expense',
    }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Expense.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => category_entity_1.Category }),
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, { eager: true }),
    __metadata("design:type", category_entity_1.Category)
], Expense.prototype, "category", void 0);
exports.Expense = Expense = __decorate([
    (0, typeorm_1.Entity)()
], Expense);
//# sourceMappingURL=expense.entity.js.map