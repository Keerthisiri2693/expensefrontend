import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("expense_cache.db");
  }

  return db;
};


// ==========================================================
// INITIALIZE
// ==========================================================

export const initExpenseCache = async () => {
  const database = await getDB();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_expenses (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT,
      category TEXT,
      amount REAL,
      expense_date TEXT,
      description TEXT,
      receipt_path TEXT,
      status TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  console.log("✅ EXPENSE CACHE INITIALIZED");
};


// ==========================================================
// SAVE EXPENSES
// ==========================================================

export const cacheExpenses = async (
  expenses: any[]
) => {
  try {
    const database = await getDB();

    await database.withTransactionAsync(async () => {

      for (const expense of expenses) {

        await database.runAsync(
          `
          INSERT OR REPLACE INTO cached_expenses (
            id,
            title,
            category,
            amount,
            expense_date,
            description,
            receipt_path,
            status,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          expense.id,
          expense.title ?? "",
          expense.category ?? "",
          Number(expense.amount ?? 0),
          expense.expense_date ?? "",
          expense.description ?? "",
          expense.receipt_path ?? "",
          expense.status ?? "",
          expense.created_at ?? "",
          expense.updated_at ?? ""
        );
      }
    });

    console.log(
      `💾 CACHED ${expenses.length} EXPENSES`
    );

  } catch (error) {

    console.log(
      "❌ CACHE EXPENSE ERROR:",
      error
    );

  }
};


// ==========================================================
// GET CACHED EXPENSES
// ==========================================================

export const getCachedExpenses = async () => {
  try {

    const database = await getDB();

    const result =
      await database.getAllAsync(
        `
        SELECT *
        FROM cached_expenses
        ORDER BY expense_date DESC, id DESC
        `
      );

    console.log(
      `📦 CACHED EXPENSES: ${result.length}`
    );

    return result;

  } catch (error) {

    console.log(
      "❌ GET CACHE ERROR:",
      error
    );

    return [];
  }
};


// ==========================================================
// CLEAR CACHE
// ==========================================================

export const clearExpenseCache = async () => {
  try {

    const database = await getDB();

    await database.runAsync(
      `DELETE FROM cached_expenses`
    );

    console.log(
      "🗑️ EXPENSE CACHE CLEARED"
    );

  } catch (error) {

    console.log(
      "❌ CLEAR CACHE ERROR:",
      error
    );

  }
};