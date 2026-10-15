import type { Database, SqlValue as WasmSqlValue } from "sql.js";
import type { SqlDatabase, SqlValue } from "./database";

/** Keep the transaction engine identical across native and browser SQLite. */
export function adaptBrowserSqlite(database: Database): SqlDatabase {
  return {
    exec: sql => database.exec(sql),
    prepare: sql => ({
      run: (...parameters: SqlValue[]) => database.run(sql, parameters as WasmSqlValue[]),
      all: (...parameters: SqlValue[]) => {
        const statement = database.prepare(sql);
        try {
          statement.bind(parameters as WasmSqlValue[]);
          const rows: Record<string, unknown>[] = [];
          while (statement.step()) rows.push(statement.getAsObject());
          return rows;
        } finally { statement.free(); }
      },
      get: (...parameters: SqlValue[]) => {
        const statement = database.prepare(sql);
        try {
          statement.bind(parameters as WasmSqlValue[]);
          return statement.step() ? statement.getAsObject() : undefined;
        } finally { statement.free(); }
      },
    }),
    close: () => database.close(),
  };
}
