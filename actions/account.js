"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function changeDefaultAccount(accoundId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error();

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const updatedAccount = await db.account.update({
      where: {
        id: accoundId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...updatedAccount, balance: parseFloat(updatedAccount.balance) },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getAccountDetails(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error();

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: {
          date: "desc",
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!account) return null;

  return {
    success: true,
    data: {
      ...account,
      transactions: account.transactions.map((transaction) => ({
        ...transaction,
        amount: parseFloat(transaction.amount),
      })),
    },
  };
}
