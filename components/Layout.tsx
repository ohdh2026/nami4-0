
import React, { useState } from 'react';
import { 
  Menu, X, Anchor, Users, LayoutDashboard, ClipboardList, Send, LogOut, Ship, ShieldCheck 
} from 'lucide-react';
import { User, UserRole, PageView } from '../types';

interface LayoutProps {
  currentUser: User;
  activeView: PageView;
  setActiveView: (view: PageView) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentUser, activeView, setActiveView, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isCaptainOrEngineer = currentUser.role === UserRole.CAPTAIN || currentUser.role === UserRole.CHIEF_ENGINEER;

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
    { id: 'log-entry', label: '운항정보 입력', icon: ClipboardList, roles: [UserRole.CAPTAIN, UserRole.CHIEF_ENGINEER, UserRole.ADMIN] },
    { id: 'log-list', label: '운항일지 관리', icon: Anchor, roles: [UserRole.ADMIN, UserRole.CAPTAIN] },
    { id: 'user-mgmt', label: '인력 관리', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'ship-mgmt', label: '선박 정보', icon: Ship, roles: [UserRole.ADMIN] },
    { id: 'telegram-settings', label: 'Telegram 알림', icon: Send, roles: [UserRole.ADMIN] },
  ].filter(item => item.roles.includes(currentUser.role));

  const handleNav = (id: PageView) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 no-print">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Anchor className="text-sky-400 w-8 h-8" />
          <h1 className="text-xl font-bold leading-tight">나미나라<br/>운항관리</h1>
        </div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as PageView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sky-400">
              <ShieldCheck size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Top Bar - Mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white no-print">
        <div className="flex items-center gap-2">
          <Anchor className="text-sky-400" />
          <span className="font-bold">나미나라 운항관리</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 text-white p-6 flex flex-col md:hidden no-print">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-2 text-xl font-bold">
                <Anchor className="text-sky-400" />
                나미나라 운항관리
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)}><X size={32}/></button>
          </div>
          <nav className="space-y-4 flex-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as PageView)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-lg ${
                  activeView === item.id ? 'bg-sky-600' : 'bg-slate-800'
                }`}
              >
                <item.icon size={24} />
                {item.label}
              </button>
            ))}
          </nav>
          <button 
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center gap-3 py-4 bg-red-900/30 text-red-400 rounded-xl"
          >
            <LogOut size={24} /> 로그아웃
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
