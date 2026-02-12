
import React, { useState, useEffect } from 'react';
import { User, Ship, OperationLog, UserRole, PageView, TelegramConfig } from './types';
import { db } from './services/db';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LogEntry from './pages/LogEntry';
import LogList from './pages/LogList';
import UserManagement from './pages/UserManagement';
import ShipManagement from './pages/ShipManagement';
import TelegramSettings from './pages/TelegramSettings';
import { Anchor, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({ botToken: '', recipients: [] });
  const [activeView, setActiveView] = useState<PageView>('dashboard');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    setUsers(db.getUsers());
    setShips(db.getShips());
    setLogs(db.getLogs());
    setTelegramConfig(db.getTelegramConfig());
  }, []);

  // Sync state to local DB
  useEffect(() => { if (users.length) db.saveUsers(users); }, [users]);
  useEffect(() => { if (ships.length) db.saveShips(ships); }, [ships]);
  useEffect(() => { db.saveLogs(logs); }, [logs]);
  useEffect(() => { db.saveTelegramConfig(telegramConfig); }, [telegramConfig]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === UserRole.CAPTAIN || user.role === UserRole.CHIEF_ENGINEER) {
      setActiveView('log-entry');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => setCurrentUser(null);

  const saveLog = (log: OperationLog) => {
    // Phase 7: Telegram notification logic (simulated)
    const isNew = !logs.find(l => l.id === log.id);
    const prevLog = !isNew ? logs.find(l => l.id === log.id) : null;
    
    // Arrival Alert Logic
    if (log.status === 'completed' && log.arrivalTime && (!prevLog || !prevLog.arrivalTime)) {
      console.log(`TELEGRAM ALERT: ${log.shipName} (${log.captainName}) 도착 완료 - 승선객: ${log.passengerCount}명`);
    } else if (isNew && log.departureTime) {
      console.log(`TELEGRAM ALERT: ${log.shipName} (${log.captainName}) 출발 - 기관장: ${log.engineerName}`);
    }

    setLogs(prev => {
      const idx = prev.findIndex(l => l.id === log.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = log;
        return next;
      }
      return [log, ...prev];
    });
    setEditingLogId(null);
    if (currentUser?.role === UserRole.ADMIN) {
      setActiveView('log-list');
    }
  };

  const deleteLog = (id: string) => setLogs(prev => prev.filter(l => l.id !== id));

  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const saveUser = (user: User) => setUsers(prev => {
    const idx = prev.findIndex(u => u.id === user.id);
    if (idx > -1) {
      const next = [...prev];
      next[idx] = user;
      return next;
    }
    return [...prev, user];
  });

  const deleteShip = (id: string) => setShips(prev => prev.filter(s => s.id !== id));
  const saveShip = (ship: Ship) => setShips(prev => {
    const idx = prev.findIndex(s => s.id === ship.id);
    if (idx > -1) {
      const next = [...prev];
      next[idx] = ship;
      return next;
    }
    return [...prev, ship];
  });

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 text-sky-600 rounded-2xl mb-4">
              <Anchor size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Naminara Republic</h1>
            <p className="text-slate-500">운항관리 시스템 로그인 (데모용 역할 선택)</p>
          </div>
          
          <div className="space-y-3">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => handleLogin(u)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-sky-500 hover:bg-sky-50 transition-all group"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                    <ShieldCheck />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">{u.role}</div>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-sky-500">&rarr;</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Logic
  const renderView = () => {
    switch (activeView) {
      case 'dashboard': 
        return <Dashboard 
          logs={logs} 
          ships={ships} 
          onNavigateToLog={(id) => {setEditingLogId(id); setActiveView('log-entry');}} 
        />;
      case 'log-entry': 
        return <LogEntry 
          currentUser={currentUser} 
          ships={ships} 
          users={users} 
          onSave={saveLog} 
          editingLog={logs.find(l => l.id === editingLogId)}
        />;
      case 'log-list': 
        return <LogList 
          logs={currentUser.role === UserRole.CAPTAIN ? logs.filter(l => l.captainId === currentUser.id) : logs} 
          ships={ships} 
          onEdit={(log) => {setEditingLogId(log.id); setActiveView('log-entry');}}
          onDelete={deleteLog}
        />;
      case 'user-mgmt': 
        return <UserManagement users={users} onSave={saveUser} onDelete={deleteUser} />;
      case 'ship-mgmt': 
        return <ShipManagement ships={ships} onSave={saveShip} onDelete={deleteShip} />;
      case 'telegram-settings': 
        return <TelegramSettings users={users} config={telegramConfig} onSaveConfig={setTelegramConfig} />;
      default: 
        return <Dashboard logs={logs} ships={ships} onNavigateToLog={(id) => {setEditingLogId(id); setActiveView('log-entry');}} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      activeView={activeView} 
      setActiveView={setActiveView} 
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
