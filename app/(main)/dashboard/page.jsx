import { getCurrentBudget } from "@/actions/budget";
import { getAccounts, getDashboardData } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/CreateAccountDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AccountCard } from "./_components/AccountCard";
import BudgetProgress from "./_components/BudgetProgress";
import DashboardOverview from "./_components/DashboardOverview";

export const dynamic = 'force-dynamic';

const DashBoard = async () => {
  const accounts = await getAccounts();
  const transactions = await getDashboardData();

  const defaultAccount = accounts?.data?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
        accountId={defaultAccount?.id}
      />

      <DashboardOverview
        accounts={accounts.data || []}
        transactions={transactions.data || []}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts?.data.length > 0 &&
          accounts?.data.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
};

export default DashBoard;
