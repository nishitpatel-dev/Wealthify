import { getAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import AddTransactionForm from "../_components/AddTransactionForm";

const AddTransactionPage = async () => {
  const accounts = await getAccounts();

  return (
    <>
      <div className="max-w-3xl mx-auto px-5">
        <div className="flex justify-center md:justify-normal mb-8">
          <h1 className="text-5xl gradient-title ">Add Transaction</h1>
        </div>
        <AddTransactionForm
          accounts={accounts.data}
          categories={defaultCategories}
        />
      </div>
    </>
  );
};

export default AddTransactionPage;
