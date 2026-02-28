import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Settings, TrendingUp, Bot } from "lucide-react";

export function MainLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-slate-800/50 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">QuantNova</h1>
              <p className="text-xs text-slate-400">AI Trading Bot</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <Link
              to="/"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive("/")
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-400 shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/configure"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive("/configure")
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-400 shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
            >
              <Settings className="h-5 w-5" />
              <span>Bot Configuration</span>
            </Link>

            <Link
              to="/analytics"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive("/analytics")
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-400 shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Analytics</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-800/50 px-6 py-4">
            <p className="text-xs text-slate-500">© 2026 QuantNova</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}
