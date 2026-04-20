"use client";

import React from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { useCreateCategory } from '@/lib/hooks/useCreateCategory';
import { useDeleteCategory } from '@/lib/hooks/useDeleteCategory';
import { Category } from '@/lib/api';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner"; // Using sonner for toast notifications

const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading, isError, error } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Category name must be at least 2 characters.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createCategoryMutation.mutateAsync(values.name);
      form.reset();
      toast("Success", {
        description: "Category created successfully.",
      });
    } catch (err) {
      toast("Error", {
        description: `Failed to create category: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast("Success", {
        description: "Category deleted successfully.",
      });
    } catch (err) {
      toast("Error", {
        description: `Failed to delete category: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }
  }

  if (isLoading) return <div>Loading categories...</div>;
  if (isError) return <div>Error loading categories: {error?.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Categorias</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Category</h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
          <Input
            {...form.register("name")}
            placeholder="Category Name"
            className="flex-1"
          />
          <Button type="submit" disabled={createCategoryMutation.isPending}>
            {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
          </Button>
        </form>
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Categories</h2>
        {categories && categories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: Category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No categories found.</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
