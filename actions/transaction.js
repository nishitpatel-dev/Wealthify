"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account Not Found");

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = parseFloat(account.balance) + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: {
          id: data.accountId,
        },
        data: {
          balance: newBalance,
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return {
      success: true,
      data: { ...transaction, amount: parseFloat(transaction.amount) },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

function calculateNextRecurringDate(transactionDate, interval) {
  switch (interval) {
    case "DAILY":
      transactionDate.setDate(transactionDate.getDate() + 1);
      break;
    case "WEEKLY":
      transactionDate.setDate(transactionDate.getDate() + 7);
      break;
    case "MONTHLY":
      transactionDate.setMonth(transactionDate.getMonth() + 1);
      break;
    case "YEARLY":
      transactionDate.setFullYear(transactionDate.getFullYear() + 1);
      break;
  }

  return transactionDate;
}
