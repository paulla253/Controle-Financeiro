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
exports.AnnualSpendingDto = exports.DashboardDataDto = exports.SpendingByCategory = void 0;
const swagger_1 = require("@nestjs/swagger");
class SpendingByCategory {
}
exports.SpendingByCategory = SpendingByCategory;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], SpendingByCategory.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lazer' }),
    __metadata("design:type", String)
], SpendingByCategory.prototype, "categoryName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 250.5 }),
    __metadata("design:type", Number)
], SpendingByCategory.prototype, "total", void 0);
class DashboardDataDto {
}
exports.DashboardDataDto = DashboardDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1250.75 }),
    __metadata("design:type", Number)
], DashboardDataDto.prototype, "totalSpentThisMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => [SpendingByCategory] }),
    __metadata("design:type", Array)
], DashboardDataDto.prototype, "spendingByCategory", void 0);
class AnnualSpendingDto {
}
exports.AnnualSpendingDto = AnnualSpendingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Janeiro" }),
    __metadata("design:type", String)
], AnnualSpendingDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1230.50 }),
    __metadata("design:type", Number)
], AnnualSpendingDto.prototype, "total", void 0);
//# sourceMappingURL=dashboard-data.dto.js.map