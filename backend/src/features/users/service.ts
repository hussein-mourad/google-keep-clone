import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserById = async (id: number) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  return user;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
};

export const getUsers = async () => {
  return db.select().from(usersTable);
};

export const createUser = async (email: string, password: string) => {
  const [user] = await db
    .insert(usersTable)
    .values({ email, password })
    .returning();
  return user;
};

export const deleteUser = async (id: number) => {
  const [user] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning();
  return user;
};
