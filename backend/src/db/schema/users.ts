// import { text, pgTable, varchar, serial } from "drizzle-orm/pg-core";
// import { withTimestamps } from "./timestamps";
//
// export const usersTable = pgTable("users", {
//   id: serial().primaryKey(),
//   email: varchar({ length: 255 }).notNull().unique(),
//   password: varchar({ length: 255 }).notNull(),
//
//   ...withTimestamps,
// });
//
// export type User = typeof usersTable.$inferSelect;
// export type NewUser = typeof usersTable.$inferInsert;
