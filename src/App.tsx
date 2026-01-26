import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PeriodProvider } from "./contexts/PeriodContext";
import { FilterProvider } from "./contexts/FilterContext";
import { TransactionsProvider } from "./contexts/TransactionsContext";
import { CategoriesProvider } from "./contexts/CategoriesContext";
import { AccountsProvider } from "./contexts/AccountsContext";
import { CreditCardsProvider } from "./contexts/CreditCardsContext";
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import CategoryReport from "./pages/CategoryReport";
import BankAccounts from "./pages/BankAccounts";
import AccountReport from "./pages/AccountReport";
import CreditCards from "./pages/CreditCards";
import CreditCardInvoice from "./pages/CreditCardInvoice";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TransactionsProvider>
        <CategoriesProvider>
          <AccountsProvider>
            <CreditCardsProvider>
              <PeriodProvider>
                <FilterProvider>
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
                      <Route path="/cartoes/:id/fatura" element={<CreditCardInvoice />} />
                      <Route path="/configuracoes" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </FilterProvider>
              </PeriodProvider>
            </CreditCardsProvider>
          </AccountsProvider>
        </CategoriesProvider>
      </TransactionsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;