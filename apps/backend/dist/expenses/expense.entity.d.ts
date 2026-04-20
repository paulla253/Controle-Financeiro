import { Category } from '../categories/category.entity';
export declare class Expense {
    id: number;
    description: string;
    amount: number;
    date: Date;
    category: Category;
}
