/**
 * Types ndogo za `node:sqlite` (Node 22+).
 *
 * `@types/node` ya mradi huu ni v20 ambayo bado haina moduli hii,
 * hivyo tunaisajili hapa. Ondoa faili hii ukiboresha hadi @types/node >= 22.
 */
declare module "node:sqlite" {
  export type SqliteValue = null | number | bigint | string | Uint8Array;

  export type StatementResultingChanges = {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  };

  export interface StatementSync {
    all(...params: SqliteValue[]): unknown[];
    get(...params: SqliteValue[]): unknown;
    run(...params: SqliteValue[]): StatementResultingChanges;
    setReadBigInts(enabled: boolean): void;
  }

  export interface DatabaseSyncOptions {
    open?: boolean;
    readOnly?: boolean;
    enableForeignKeyConstraints?: boolean;
    enableDoubleQuotedStringLiterals?: boolean;
  }

  export class DatabaseSync {
    constructor(path: string, options?: DatabaseSyncOptions);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
