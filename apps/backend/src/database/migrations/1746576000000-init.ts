import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1746576000000 implements MigrationInterface {
  name = 'Init1746576000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL COLLATE NOCASE,
        "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "date" DATE NOT NULL,
        "amount" NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
        "categoryId" INTEGER NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "FK_expenses_category" FOREIGN KEY ("categoryId")
          REFERENCES "categories" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_expenses_date" ON "expenses" ("date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_expenses_category_id" ON "expenses" ("categoryId")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_expenses_category_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_expenses_date"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
  }
}
