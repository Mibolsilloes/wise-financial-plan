import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { FinancialCards } from "@/components/dashboard/FinancialCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { ChartPanel } from "@/components/dashboard/ChartPanel";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LayoutGrid, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "clasico" | "dashboard";

const Index = () => {
  const [view, setView] = useState<ViewMode>("clasico");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Planifica tu dinero</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestiona tus finanzas de forma inteligente
            </p>
          </div>

          {/* View toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted self-start sm:self-end">
            <button
              onClick={() => setView("clasico")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                view === "clasico"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Vista clásica
            </button>
            <button
              onClick={() => setView("dashboard")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                view === "dashboard"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>

        {/* Period Selector & Filters */}
        <PeriodSelector />

        {view === "clasico" ? (
          <>
            <FinancialCards />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <TransactionList />
              </div>
              <div className="xl:col-span-1">
                <ChartPanel />
              </div>
            </div>
          </>
        ) : (
          <DashboardView />
        )}
      </div>
    </Layout>
  );
};

export default Index;