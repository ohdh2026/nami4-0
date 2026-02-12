
import React, { useState, useEffect } from 'react';
import { 
  Clock, Users, Fuel, Anchor, Save, Edit3, CheckCircle, AlertCircle, Ship as ShipIcon, UserCircle
} from 'lucide-react';
import { User, Ship, UserRole, OperationLog } from '../types';

interface LogEntryProps {
  currentUser: User;
  ships: Ship[];
  users: User[];
  onSave: (log: OperationLog) => void;
  editingLog?: OperationLog | null;
}

const LogEntry: React.FC<LogEntryProps> = ({ currentUser, ships, users, onSave, editingLog }) => {
  const [formData, setFormData] = useState<Partial<OperationLog>>({
    shipName: '',
    captainId: '',
    captainName: '',
    engineerId: '',
    engineerName: '',
    crewIds: [],
    crewNames: [],
    departureTime: '',
    arrivalTime: '',
    passengerCount: 0,
    fuelLevel: 100,
    memo: '',
    status: 'draft'
  });

  const captains = users.filter(u => u.role === UserRole.CAPTAIN);
  const engineers = users.filter(u => u.role === UserRole.CHIEF_ENGINEER);
  const crews = users.filter(u => u.role === UserRole.CREW);

  useEffect(() => {
    if (editingLog) {
      setFormData(editingLog);
    } else {
      // 초기값 설정: 선장인 경우 본인 자동 선택
      if (currentUser.role === UserRole.CAPTAIN) {
        setFormData(prev => ({ 
          ...prev, 
          captainId: currentUser.id, 
          captainName: currentUser.name,
          departureTime: new Date().toISOString().slice(0, 16) 
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          departureTime: new Date().toISOString().slice(0, 16) 
        }));
      }
    }
  }, [editingLog, currentUser]);

  const setNow = (field: 'departureTime' | 'arrivalTime') => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData(prev => ({ ...prev, [field]: now.toISOString().slice(0, 16) }));
  };

  const handleCrewToggle = (crewId: string) => {
    setFormData(prev => {
      const currentIds = prev.crewIds || [];
      if (currentIds.includes(crewId)) {
        return { ...prev, crewIds: currentIds.filter(id => id !== crewId) };
      } else {
        return { ...prev, crewIds: [...currentIds, crewId] };
      }
    });
  };

  // 저장 가능 여부 (최소 선박/선장/기관장/출발시간/인원/유류는 있어야 함)
  const canSaveDraft = !!(formData.shipName && formData.captainId && formData.engineerId && formData.departureTime);
  const canSubmit = canSaveDraft && !!(formData.arrivalTime);

  const handleSave = (status: 'draft' | 'completed') => {
    if (!canSaveDraft) {
      alert('필수 정보를 모두 입력해주세요 (선박, 선장, 기관장, 출발시간)');
      return;
    }

    const finalLog: OperationLog = {
      id: formData.id || `log-${Date.now()}`,
      shipName: formData.shipName!,
      captainId: formData.captainId!,
      captainName: users.find(u => u.id === formData.captainId)?.name || '',
      engineerId: formData.engineerId!,
      engineerName: users.find(u => u.id === formData.engineerId)?.name || '',
      crewIds: formData.crewIds || [],
      crewNames: (formData.crewIds || []).map(id => users.find(u => u.id === id)?.name || ''),
      departureTime: formData.departureTime!,
      arrivalTime: formData.arrivalTime || '',
      passengerCount: Number(formData.passengerCount) || 0,
      fuelLevel: Number(formData.fuelLevel) || 0,
      memo: formData.memo || '',
      status: status,
      createdAt: formData.createdAt || new Date().toISOString()
    };
    onSave(finalLog);
    alert(status === 'completed' ? '제출되었습니다.' : '임시 저장되었습니다.');
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      <header className="px-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Edit3 className="text-sky-600" />
          {editingLog ? '운항일지 수정' : '오늘의 운항 정보'}
        </h1>
        <p className="text-slate-500">안전 운항을 위해 정확하게 입력해주세요.</p>
      </header>

      {/* 1. 선박 및 인력 설정 */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShipIcon size={16} /> 선박 및 운항 요원
        </h2>
        
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 block mb-2">운항 선박</span>
            <select 
              value={formData.shipName} 
              onChange={(e) => setFormData({...formData, shipName: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg"
            >
              <option value="">선박을 선택하세요</option>
              {ships.map(s => <option key={s.id} value={s.name}>{s.name} (정원: {s.capacity}명)</option>)}
            </select>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 block mb-2">선장</span>
              <select 
                disabled={!isAdmin && currentUser.role === UserRole.CAPTAIN}
                value={formData.captainId} 
                onChange={(e) => setFormData({...formData, captainId: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg disabled:opacity-60"
              >
                <option value="">선장 선택</option>
                {captains.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700 block mb-2">기관장</span>
              <select 
                value={formData.engineerId} 
                onChange={(e) => setFormData({...formData, engineerId: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg"
              >
                <option value="">기관장 선택</option>
                {engineers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
          </div>

          <div>
            <span className="text-sm font-semibold text-slate-700 block mb-3">동승 승무원 선택</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {crews.map(u => (
                <div key={u.id} className="relative">
                  <input 
                    type="checkbox" 
                    id={`crew-${u.id}`}
                    className="hidden crew-checkbox"
                    checked={formData.crewIds?.includes(u.id)}
                    onChange={() => handleCrewToggle(u.id)}
                  />
                  <label 
                    htmlFor={`crew-${u.id}`}
                    className="flex items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium cursor-pointer transition-all hover:bg-slate-100"
                  >
                    {u.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. 운항 시간 및 데이터 */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock size={16} /> 운항 기록
        </h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-semibold text-slate-700 block mb-2">출발 시간</span>
              <div className="flex gap-2">
                <input 
                  type="datetime-local" 
                  value={formData.departureTime}
                  onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                  className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500" 
                />
                <button onClick={() => setNow('departureTime')} className="px-3 bg-slate-100 rounded-xl text-xs font-bold">지금</button>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-700 block mb-2">도착 시간</span>
              <div className="flex gap-2">
                <input 
                  type="datetime-local" 
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                  className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500" 
                />
                <button onClick={() => setNow('arrivalTime')} className="px-3 bg-slate-100 rounded-xl text-xs font-bold">지금</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 block mb-2">승선 인원</span>
              <div className="relative">
                <input 
                  type="number" 
                  inputMode="numeric"
                  value={formData.passengerCount || ''}
                  onChange={(e) => setFormData({...formData, passengerCount: Number(e.target.value)})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500 text-center text-xl font-bold"
                  placeholder="0"
                />
                <span className="absolute right-4 top-4 text-slate-400 font-medium">명</span>
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 block mb-2">남은 연료</span>
              <div className="relative">
                <input 
                  type="number" 
                  inputMode="numeric"
                  value={formData.fuelLevel || ''}
                  onChange={(e) => setFormData({...formData, fuelLevel: Number(e.target.value)})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500 text-center text-xl font-bold"
                  placeholder="100"
                />
                <span className="absolute right-4 top-4 text-slate-400 font-medium">%</span>
              </div>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 block mb-2">메모 및 특이사항</span>
            <textarea 
              rows={3}
              value={formData.memo}
              onChange={(e) => setFormData({...formData, memo: e.target.value})}
              placeholder="특이사항이 있으면 입력하세요 (기상, 장비점검 등)"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </label>
        </div>
      </section>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 flex gap-3 z-40 no-print max-w-7xl mx-auto">
        <button 
          onClick={() => handleSave('draft')}
          disabled={!canSaveDraft}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
            canSaveDraft ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <AlertCircle size={20} /> 임시 저장
        </button>
        <button 
          onClick={() => handleSave('completed')}
          disabled={!canSubmit}
          className={`flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-lg ${
            canSubmit ? 'bg-sky-600 text-white shadow-sky-200 hover:bg-sky-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle size={20} /> 운항일지 제출
        </button>
      </div>
    </div>
  );
};

export default LogEntry;
