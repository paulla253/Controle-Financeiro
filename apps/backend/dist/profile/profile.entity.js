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
exports.Profile = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let Profile = class Profile {
};
exports.Profile = Profile;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'The unique identifier of the profile',
    }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Profile.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Software Engineer',
        description: 'The job title of the user',
    }),
    (0, typeorm_1.Column)({ default: '' }),
    __metadata("design:type", String)
], Profile.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7000, description: 'The monthly income of the user' }),
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Profile.prototype, "monthlyIncome", void 0);
exports.Profile = Profile = __decorate([
    (0, typeorm_1.Entity)()
], Profile);
//# sourceMappingURL=profile.entity.js.map