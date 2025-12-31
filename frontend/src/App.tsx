import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import PlanoContas from "./pages/PlanoContas";
import Clientes from "./pages/Clientes";
import Equipamentos from "./pages/Equipamentos";
import Motoristas from "./pages/Motoristas";
import Lancamentos from "./pages/Lancamentos";
import ContasPagar from "./pages/ContasPagar";
import ContasReceber from "./pages/ContasReceber";
import Configuracoes from "./pages/Configuracoes";
import Toaster from "./components/Toaster";

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="plano-contas" element={<PlanoContas />} />
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="equipamentos" element={<Equipamentos />} />
                        <Route path="motoristas" element={<Motoristas />} />
                        <Route path="lancamentos" element={<Lancamentos />} />
                        <Route path="contas-pagar" element={<ContasPagar />} />
                        <Route path="contas-receber" element={<ContasReceber />} />
                        <Route path="configuracoes" element={<Configuracoes />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster />
        </QueryClientProvider>
    );
}

export default App;
