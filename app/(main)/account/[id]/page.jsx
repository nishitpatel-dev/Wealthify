import { getAccountDetails } from "@/actions/account";
import NotFound from "@/app/not-found";

const AccountPage = async ({ params }) => {
  const accountData = await getAccountDetails(params.id);

  if (!accountData) {
    return <NotFound />;
  }

  const {
    data: { transactions, ...account },
  } = accountData;  

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ₹{account.balance.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
