"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import Error from "next/error";

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw Error();

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw Error("User not found");

    const balanceFloat = parseFloat(data.balance);

    if (isNaN(balanceFloat)) throw Error("Invalid balance");

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
      data: newAccount,
    };
  } catch (error) {
    throw Error(error.message);
  }
}
