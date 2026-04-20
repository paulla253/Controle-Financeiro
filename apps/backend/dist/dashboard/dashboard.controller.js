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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_data_dto_1 = require("./dto/dashboard-data.dto");
const swagger_1 = require("@nestjs/swagger");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getDashboardData() {
        return this.dashboardService.getDashboardData();
    }
    getAnnualSpending(year) {
        return this.dashboardService.getAnnualSpending(year);
    }
    async getMonthlyDashboardData(month, year) {
        const dashboardData = await this.dashboardService.getDashboardData(month, year);
        return dashboardData.spendingByCategory;
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard data for current month' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return dashboard data.', type: dashboard_data_dto_1.DashboardDataDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('annual'),
    (0, swagger_1.ApiOperation)({ summary: 'Get annual spending data by month' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return annual spending data.', type: [dashboard_data_dto_1.AnnualSpendingDto] }),
    __param(0, (0, common_1.Query)('year', new common_1.ParseIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAnnualSpending", null);
__decorate([
    (0, common_1.Get)('monthly'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard data for a specific month or current month if not specified' }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: false, type: Number, description: 'Month (1-12)' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, type: Number, description: 'Year (e.g., 2023)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return monthly dashboard data.', type: [dashboard_data_dto_1.SpendingByCategory] }),
    __param(0, (0, common_1.Query)('month', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('year', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMonthlyDashboardData", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('api/dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map