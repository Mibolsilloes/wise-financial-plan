import { Layout } from "@/components/layout/Layout";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { FinancialCards } from "@/components/dashboard/FinancialCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ChartPanel } from "@/components/dashboard/ChartPanel";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Planeje sua grana</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas finanças de forma inteligente
          </p>
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
            <ChartPanel />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
