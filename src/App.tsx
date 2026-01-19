import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PeriodProvider } from "./contexts/PeriodContext";
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import CategoryReport from "./pages/CategoryReport";
import BankAccounts from "./pages/BankAccounts";
import AccountReport from "./pages/AccountReport";
import CreditCards from "./pages/CreditCards";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PeriodProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/categorias/:id/relatorio" element={<CategoryReport />} />
            <Route path="/contas" element={<BankAccounts />} />
            <Route path="/contas/:id/extrato" element={<AccountReport />} />
            <Route path="/cartoes" element={<CreditCards />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PeriodProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
