import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PeriodProvider } from "./contexts/PeriodContext";
import { FilterProvider } from "./contexts/FilterContext";
import { TransactionsProvider } from "./contexts/TransactionsContext";
import { CategoriesProvider } from "./contexts/CategoriesContext";
import { AccountsProvider } from "./contexts/AccountsContext";
import { CreditCardsProvider } from "./contexts/CreditCardsContext";
import { ResponsiblesProvider } from "./contexts/ResponsiblesContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import CategoryReport from "./pages/CategoryReport";
import BankAccounts from "./pages/BankAccounts";
import AccountReport from "./pages/AccountReport";
import CreditCards from "./pages/CreditCards";
import CreditCardInvoice from "./pages/CreditCardInvoice";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

// App component with all providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <TransactionsProvider>
            <CategoriesProvider>
              <AccountsProvider>
                <CreditCardsProvider>
                  <ResponsiblesProvider>
                  <PeriodProvider>
                    <FilterProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Routes>
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                          <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                          <Route path="/categorias" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                          <Route path="/categorias/:id/relatorio" element={<ProtectedRoute><CategoryReport /></ProtectedRoute>} />
                          <Route path="/contas" element={<ProtectedRoute><BankAccounts /></ProtectedRoute>} />
                          <Route path="/contas/:id/extrato" element={<ProtectedRoute><AccountReport /></ProtectedRoute>} />
                          <Route path="/cartoes" element={<ProtectedRoute><CreditCards /></ProtectedRoute>} />
                          <Route path="/cartoes/:id/fatura" element={<ProtectedRoute><CreditCardInvoice /></ProtectedRoute>} />
                          <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                    </FilterProvider>
                  </PeriodProvider>
                  </ResponsiblesProvider>
                </CreditCardsProvider>
              </AccountsProvider>
            </CategoriesProvider>
          </TransactionsProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;