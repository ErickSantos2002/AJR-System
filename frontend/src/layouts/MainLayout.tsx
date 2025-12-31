import { Link, Outlet, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Truck,
    UserCircle,
    FileText,
    Settings,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo_png.png";

const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/plano-contas", icon: FileText, label: "Plano de Contas" },
    { path: "/lancamentos", icon: FileText, label: "Lançamentos" },
    { path: "/clientes", icon: Users, label: "Clientes" },
    { path: "/equipamentos", icon: Truck, label: "Equipamentos" },
    { path: "/motoristas", icon: UserCircle, label: "Motoristas" },
    { path: "/configuracoes", icon: Settings, label: "Configurações" },
];

export default function MainLayout() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-r border-slate-700/50 w-64`}
            >
                <div className="h-full px-3 py-4 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-8 px-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-300 rounded-full blur-sm"></div>
                                <div className="relative bg-gradient-to-br from-cyan-300 to-blue-200 rounded-full p-1">
                                    <img
                                        src={logo}
                                        alt="AJR System"
                                        className="h-10 w-10 object-contain relative z-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    AJR System
                                </h1>
                                <p className="text-xs text-slate-500 mt-1">Gestão Contábil</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <ul className="space-y-2 font-medium">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                                            isActive
                                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                                                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                        }`}
                                    >
                                        <Icon size={20} className={`mr-3 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`${sidebarOpen ? "lg:ml-64" : ""} transition-all duration-300`}>
                {/* Top Navbar */}
                <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-slate-400 rounded-lg hover:bg-slate-800/50 hover:text-white transition-all"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-slate-400">
                                Sistema de Gestão Contábil
                            </span>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
