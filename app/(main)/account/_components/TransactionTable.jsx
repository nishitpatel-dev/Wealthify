"use client";

import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import { cn } from "@/lib/utils";
// import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTrasactions } from "@/actions/account";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useFetch from "@/hooks/useFetch";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export default function TransactionTable({ transactions }) {

  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypefilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const { data, fn, loading } = useFetch(bulkDeleteTrasactions);

  // Sort and select UI

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field == field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      selectedIds.includes(id)
        ? selectedIds.filter((item) => item != id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((transaction) => transaction.id)
    );
  };

  // Functionality

  const handleBulkDelete = async () => {
    await fn(selectedIds);
    setSelectedIds([]);
  };

  useEffect(() => {
    if (data && !loading) {
      toast.error("Transactions deleted successfully");
    }
  }, [data, loading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypefilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  let filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Applying Search Filter, Recurring Filter, and Type Filter

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((ele) =>
        ele.description.toLowerCase().includes(searchLower)
      );
    }

    if (recurringFilter) {
      result = result.filter((ele) => {
        if (recurringFilter === "recurring") return ele.isRecurring === true;
        else return ele.isRecurring === false;
      });
    }

    if (typeFilter) {
      result = result.filter((ele) => ele.type === typeFilter);
    }

    // Applying Sorting

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
          break;
      }

      return sortConfig.direction == "asc" ? comparison : -comparison;
    });

    // Applying Pagination
    const endPage = page * 10;
    result = result.slice(endPage - 10, endPage);

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig, page]);

  return (
    <div className="space-y-4">
      {loading && <BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      {/* Filters */}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Term */}

        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-8"
          />
        </div>

        {/* All Other Terms After Search On Filters Section */}

        <div className="flex gap-2 flex-wrap">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypefilter(value);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="INCOME">
                Income
              </SelectItem>
              <SelectItem className="cursor-pointer" value="EXPENSE">
                Expense
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer" value="recurring">
                Recurring Only
              </SelectItem>
              <SelectItem className="cursor-pointer" value="non-recurring">
                Non-recurring Only
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsOpen(true)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting Selected ({selectedIds.length})
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedIds.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {isOpen && (
            <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to delete this {selectedIds.length}{" "}
                    transactions?
                  </DialogTitle>
                  <DialogDescription style={{ marginTop: "10px" }}>
                    This action cannot be undone. This will permanently delete
                    your selected {selectedIds.length} transactions.
                  </DialogDescription>

                  <DialogFooter
                    className="sm:justify-start gap-2 sm:gap-0"
                    style={{ marginTop: "20px" }}
                  >
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsOpen(false);
                        handleBulkDelete();
                      }}
                    >
                      Delete
                    </Button>
                    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length ===
                      filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 py-1 rounded text-white text-sm"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}₹
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {
                                RECURRING_INTERVALS[
                                  transaction.recurringInterval
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {format(
                                  new Date(transaction.nextRecurringDate),
                                  "PPP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                          className="cursor-pointer"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={async () => await fn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {transactions.length > 10 ? (
          <Pagination className={"my-6"}>
            <PaginationContent>
              {page <= 1 ? null : (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(page - 1)}
                    className={"cursor-pointer"}
                  />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink
                  onClick={() => setPage(page)}
                  className={
                    "cursor-pointer bg-black text-white hover:bg-black hover:text-white rounded-full hover:rounded-full"
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>

              {page >=
              (transactions.length % 10 != 0
                ? parseInt(transactions.length / 10 + 1)
                : parseInt(transactions.length / 10)) ? null : (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setPage(page + 1)}
                    className={cn("cursor-pointer hover:rounded-full")}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {page >=
              (transactions.length % 10 != 0
                ? parseInt(transactions.length / 10)
                : parseInt(transactions.length / 10 - 1)) ? null : (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {page >=
              (transactions.length % 10 != 0
                ? parseInt(transactions.length / 10 + 1)
                : parseInt(transactions.length / 10)) ? null : (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(page + 1)}
                    className={"cursor-pointer"}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
    </div>
  );
}
