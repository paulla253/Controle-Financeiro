"use client";

import React, { useState, ChangeEvent } from 'react';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useCreateExpense } from '@/lib/hooks/useCreateExpense';
import { useCategories } from '@/lib/hooks/useCategories';
import { useExportExpenses } from '@/lib/hooks/useExportExpenses';
import { useImportExpenses } from '@/lib/hooks/useImportExpenses';
import { Expense, ExpenseFilter, Category, CsvExpense } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Papa from 'papaparse';

// Form Schema for adding expenses
const expenseFormSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive({ message: "Amount must be positive." })
  ),
  date: z.date(),
  categoryId: z.string().min(1, { message: "Category is required." }),
});

const ExpensesPage: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFilter>({});
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const { data: expenses, isLoading, isError, error } = useExpenses(filters);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const createExpenseMutation = useCreateExpense(); // Correctly declared at top-level
  const exportExpensesMutation = useExportExpenses();
  const importExpensesMutation = useImportExpenses();

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      categoryId: "",
    },
  });

  // Handle filter changes
  React.useEffect(() => {
    setFilters({
      startDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
      endDate: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
      categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
    });
  }, [fromDate, toDate, selectedCategoryId]);

  async function onSubmit(values: z.infer<typeof expenseFormSchema>) {
    try {
      await createExpenseMutation.mutateAsync({ // Direct call
        description: values.description,
        amount: values.amount,
        date: format(values.date, 'yyyy-MM-dd'),
        categoryId: values.categoryId,
      });
      form.reset({ description: "", amount: 0, date: new Date(), categoryId: "" });
      toast("Success", {
        description: "Expense added successfully.",
      });
    } catch (err) {
      toast("Error", {
        description: `Failed to add expense: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }
  }

  const handleExport = async () => {
    try {
      await exportExpensesMutation.mutateAsync();
      toast("Success", {
        description: "Expenses exported successfully.",
      });
    } catch (err) {
      toast("Error", {
        description: `Failed to export expenses: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast("Error", {
        description: "No file selected.",
      });
      return;
    }

    Papa.parse<CsvExpense>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedExpenses = results.data;
        const errors = results.errors;

        if (errors.length > 0) {
          toast("Error", {
            description: "CSV parsing errors found. Please check console for details.",
          });
          console.error("CSV Parsing Errors:", errors);
          return;
        }

        // Basic client-side validation
        const validationErrors: { row: number; message: string }[] = [];
        parsedExpenses.forEach((exp, index) => {
          if (!exp.description || !exp.amount || !exp.date || !exp.categoryName) {
            validationErrors.push({ row: index + 1, message: "Missing required fields." });
          }
          if (isNaN(Number(exp.amount)) || Number(exp.amount) <= 0) {
            validationErrors.push({ row: index + 1, message: "Invalid amount." });
          }
          if (!categories?.some(cat => cat.name === exp.categoryName)) {
            validationErrors.push({ row: index + 1, message: `Category '${exp.categoryName}' not found.` });
          }
          // More date validation could go here
        });

        if (validationErrors.length > 0) {
          toast("Error", {
            description: `Client-side validation failed with ${validationErrors.length} errors.`,
          });
          console.error("Client-side validation errors:", validationErrors);
          return;
        }

        try {
          const result = await importExpensesMutation.mutateAsync(file);
          toast("Success", {
            description: `${result.importedCount} expenses imported successfully.`,
          });
          if (result.errors.length > 0) {
            toast("Warning", {
              description: `${result.errors.length} errors occurred during import on the server.`,
            });
            console.warn("Server-side import errors:", result.errors);
          }
        } catch (err) {
          toast("Error", {
            description: `Failed to import expenses: ${err instanceof Error ? err.message : "Unknown error"}`,
          });
        }
      },
      error: (err) => {
        toast("Error", {
          description: `Error parsing CSV file: ${err.message}`,
        });
      }
    });
  };

  if (isLoadingCategories) return <div>Loading categories for filters...</div>;
  if (isLoading) return <div>Loading expenses...</div>;
  if (isError) return <div>Error loading expenses: {error?.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Despesas</h1>

      <div className="flex justify-end space-x-2 mb-6">
        <Button onClick={handleExport} disabled={exportExpensesMutation.isPending}>
          {exportExpensesMutation.isPending ? "Exporting..." : "Export Expenses"}
        </Button>
        <Input
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
          id="import-csv-input"
        />
        <label htmlFor="import-csv-input">
          <Button asChild>
            Import Expenses
          </Button>
        </label>
      </div>

      {/* Expense Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">De:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Até:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoria:</label>
              <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Expense Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adicionar Nova Despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <Input
                {...form.register("description")}
                placeholder="Descrição da despesa"
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Valor</label>
              <Input
                type="number"
                step="0.01"
                {...form.register("amount")}
                placeholder="0.00"
              />
              {form.formState.errors.amount && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("date") ? format(form.watch("date"), "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => form.setValue("date", date || new Date())}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <Select onValueChange={(value) => form.setValue("categoryId", value)} value={form.watch("categoryId")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.categoryId.message}</p>
              )}
            </div>
            <div className="col-span-full">
              <Button type="submit" disabled={createExpenseMutation.isPending}>
                {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense: Expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category.name}</TableCell>
                    <TableCell className="text-right">R$ {expense.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Nenhuma despesa encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
