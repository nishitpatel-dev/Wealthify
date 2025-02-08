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

    await db.$transaction(async (tx) => {
      await tx.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      await tx.budget.updateMany({
        where: {
          userId: user.id,
          isAccountDefaultBudget: true,
        },
        data: {
          isAccountDefaultBudget: false,
        },
      });
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

    await db.budget.update({
      where: {
        userId: user.id,
        accountId: accoundId,
      },
      data: {
        isAccountDefaultBudget: true,
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

export async function bulkDeleteTrasactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error();

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
        userId: user.id,
      },
    });

    const accountBalanceChange = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type == "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      acc[transaction.accountId] = (acc[transaction.accoundId] || 0) + change;
      return acc;
    }, {});

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: {
            in: transactionIds,
          },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChange
      )) {
        await tx.account.update({
          where: {
            id: accountId,
          },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transactions[0].accountId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
