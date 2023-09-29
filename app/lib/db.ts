import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const startDb = async () => {
    try {
        await prisma.$connect();
    } catch (error) {
        console.log(error);

        throw new Error("Unable to connect to database!")
    }
}

