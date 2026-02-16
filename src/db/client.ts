import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

// Create an extended PrismaClient type that includes all models
const createPrismaClient = () => {
  // Resolve database path from DATABASE_URL env var
  const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const dbPath = dbUrl.replace("file:", "");
  
  // Resolve to absolute path if relative
  const absoluteDbPath = path.isAbsolute(dbPath) 
    ? dbPath 
    : path.join(process.cwd(), dbPath);
  
  const adapter = new PrismaBetterSqlite3({ url: absoluteDbPath });
  
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
