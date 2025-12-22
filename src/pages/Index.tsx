import { Layout } from "@/components/layout/Layout";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { FinancialCards } from "@/components/dashboard/FinancialCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Planeje sua grana</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie suas finanças de forma inteligente
            </p>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary">
            <Plus className="w-4 h-4" />
            Nova transação
          </Button>
        </div>

        {/* Period Selector & Filters */}
        <PeriodSelector />

        {/* Financial Summary Cards */}
        <FinancialCards />

        {/* Transactions & Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <TransactionList />
          </div>
          <div className="xl:col-span-1">
            <ExpenseChart />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
