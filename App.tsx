
import React, { useState, useEffect, useRef } from 'react';
import { User, Ship, OperationLog, UserRole, PageView, TelegramConfig, WeatherInfo } from './types';
import { db } from './services/db';
import { fetchRealtimeWeather } from './services/weather';
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
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({ botToken: '', recipients: [] });
  const [activeView, setActiveView] = useState<PageView>('dashboard');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  // 로그인 관련 상태
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isInitialLoadRef = useRef(true);

  // 1. 초기 데이터 로드
  useEffect(() => {
    const init = async () => {
      try {
        const [loadedUsers, loadedShips, loadedLogs, loadedTelegram] = await Promise.all([
          db.getUsers(),
          db.getShips(),
          db.getLogs(),
          db.getTelegramConfig()
        ]);

        setUsers(loadedUsers);
        setShips(loadedShips);
        setLogs(loadedLogs);
        setTelegramConfig(loadedTelegram);
        
        // 실시간 날씨 로드
        fetchRealtimeWeather().then(data => setWeather(data));
      } catch (err) {
        console.error("Data loading failed:", err);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 100);
      }
    };
    init();
  }, []);

  // 2. 상태 변경 시 서버 저장
  useEffect(() => { 
    if (!isInitialLoadRef.current) db.saveUsers(users); 
  }, [users]);

  useEffect(() => { 
    if (!isInitialLoadRef.current) db.saveShips(ships); 
  }, [ships]);

  useEffect(() => { 
    if (!isInitialLoadRef.current) db.saveLogs(logs); 
  }, [logs]);

  useEffect(() => { 
    if (!isInitialLoadRef.current) db.saveTelegramConfig(telegramConfig); 
  }, [telegramConfig]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoginError('');
    const result = await db.login(selectedUser.id, password);
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
      if (result.user.role === UserRole.CAPTAIN || result.user.role === UserRole.CHIEF_ENGINEER) {
        setActiveView('log-entry');
      } else {
        setActiveView('dashboard');
      }
      setPassword('');
      setSelectedUser(null);
    } else {
      setLoginError(result.message || '비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => setCurrentUser(null);

  const saveLog = (log: OperationLog) => {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.id === log.id);
      let next;
      if (idx > -1) {
        next = [...prev];
        next[idx] = log;
      } else {
        next = [log, ...prev];
      }
      return next;
    });
    setEditingLogId(null);
    if (currentUser?.role === UserRole.ADMIN) {
      setActiveView('log-list');
    }
  };

  const deleteLog = (id: string) => {
    setLogs(prev => {
      const next = prev.filter(l => l.id !== id);
      db.saveLogs(next);
      return next;
    });
  };

  const deleteAllLogs = () => {
    setLogs([]);
    db.clearAllLogs();
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="font-bold animate-pulse">시스템 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-10 space-y-8 border border-white/20">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 text-sky-600 rounded-3xl mb-4 shadow-inner">
              <Anchor size={48} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Naminara Republic</h1>
            <p className="text-slate-500 font-medium">운항관리 시스템 로그인</p>
          </div>
          
          {!selectedUser ? (
            <div className="space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">사용자 선택</p>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-sky-500 hover:bg-sky-50 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                      <ShieldCheck />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{u.role}</div>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-sky-500">&rarr;</div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <ShieldCheck />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{selectedUser.name}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{selectedUser.role}</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {setSelectedUser(null); setPassword(''); setLoginError('');}}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  변경
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">비밀번호 입력</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-sky-500 focus:ring-0 outline-none transition-all font-mono"
                />
                {loginError && <p className="text-red-500 text-xs font-bold px-2">{loginError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-sky-600 transition-all shadow-lg shadow-slate-200"
              >
                로그인
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': 
        return <Dashboard 
          logs={logs} 
          ships={ships} 
          weather={weather}
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
          onDeleteAll={deleteAllLogs}
        />;
      case 'user-mgmt': 
        return <UserManagement users={users} onSave={saveUser} onDelete={deleteUser} />;
      case 'ship-mgmt': 
        return <ShipManagement ships={ships} onSave={saveShip} onDelete={deleteShip} />;
      case 'telegram-settings': 
        return <TelegramSettings users={users} config={telegramConfig} onSaveConfig={setTelegramConfig} />;
      default: 
        return <Dashboard logs={logs} ships={ships} weather={weather} onNavigateToLog={(id) => {setEditingLogId(id); setActiveView('log-entry');}} />;
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
