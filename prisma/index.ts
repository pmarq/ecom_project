//@ts-nocheck
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

let prisma: PrismaClient;
declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}

if (process.env.NODE_ENV !== "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
