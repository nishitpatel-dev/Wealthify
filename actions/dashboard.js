"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error();

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const balanceFloat = parseFloat(data.balance);

    if (isNaN(balanceFloat)) throw new Error("Invalid balance");

    const existingAccount = await db.account.findMany({
      where: {
        userId: user.id,
      },
    });

    const shouldBeDefault =
      existingAccount.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAccount = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: { ...newAccount, balance: parseFloat(newAccount.balance) },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error();

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return {
      success: true,
      data: accounts.map((account) => ({
        ...account,
        balance: parseFloat(account.balance),
      })),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
