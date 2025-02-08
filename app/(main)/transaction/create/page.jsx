import { getAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "../_components/AddTransactionForm";
import { getTransaction } from "@/actions/transaction";

export const dynamic = 'force-dynamic';

const AddTransactionPage = async ({ searchParams }) => {
  const accounts = await getAccounts();

  const { edit } = await searchParams;

  let currentTransaction;

  if (edit) {
    currentTransaction = await getTransaction(edit);
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-5">
        <div className="flex justify-center md:justify-normal mb-8">
          <h1 className="text-5xl gradient-title ">
            {edit ? "Edit Transaction" : "Add Transaction"}
          </h1>
        </div>
        <AddTransactionForm
          accounts={accounts.data}
          categories={defaultCategories}
          currentTransaction={currentTransaction?.data}
        />
      </div>
    </>
  );
};

export default AddTransactionPage;
