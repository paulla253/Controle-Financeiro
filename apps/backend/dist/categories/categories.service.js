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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./category.entity");
const expense_entity_1 = require("../expenses/expense.entity");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository, expenseRepository) {
        this.categoryRepository = categoryRepository;
        this.expenseRepository = expenseRepository;
    }
    async create(createCategoryDto) {
        const existingCategory = await this.categoryRepository.findOne({
            where: { name: createCategoryDto.name },
        });
        if (existingCategory) {
            throw new common_1.ConflictException(`Category with name "${createCategoryDto.name}" already exists.`);
        }
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }
    findAll() {
        return this.categoryRepository.find();
    }
    findOne(id) {
        return this.categoryRepository.findOneBy({ id });
    }
    async update(id, updateCategoryDto) {
        await this.categoryRepository.update(id, updateCategoryDto);
        return this.categoryRepository.findOneBy({ id });
    }
    async remove(id) {
        const categoryToRemove = await this.categoryRepository.findOneBy({ id });
        if (!categoryToRemove) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        let uncategorized = await this.categoryRepository.findOne({ where: { name: 'Uncategorized' } });
        if (!uncategorized) {
            uncategorized = this.categoryRepository.create({ name: 'Uncategorized' });
            await this.categoryRepository.save(uncategorized);
        }
        await this.expenseRepository.update({ category: categoryToRemove }, { category: uncategorized });
        await this.categoryRepository.delete(id);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map