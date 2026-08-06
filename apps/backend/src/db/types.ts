import type { NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type DrizzleDB = NodePgDatabase<typeof schema>;

export type DrizzleClient =
  | NodePgDatabase<typeof schema>
  | PgTransaction<NodePgQueryResultHKT, typeof schema>;
