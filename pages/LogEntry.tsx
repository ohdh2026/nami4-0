
import React, { useState, useEffect } from 'react';
import { 
  Clock, Users, Fuel, Anchor, Save, Edit3, Trash2, CheckCircle, AlertCircle 
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
    captainId: currentUser.role === UserRole.CAPTAIN ? currentUser.id : '',
    captainName: currentUser.role === UserRole.CAPTAIN ? currentUser.name : '',
    engineerId: '',
    engineerName: '',
    crewIds: [],
    crewNames: [],
    departureTime: '',
    arrivalTime: '',
    passengerCount: 0,
    fuelLevel: 0,
    memo: '',
    status: 'draft'
  });

  const engineers = users.filter(u => u.role === UserRole.CHIEF_ENGINEER);
  const crews = users.filter(u => u.role === UserRole.CREW);

  useEffect(() => {
    if (editingLog) {
      setFormData(editingLog);
    } else {
      // Auto-populate current user as captain if applicable
      if (currentUser.role === UserRole.CAPTAIN) {
        setFormData(prev => ({ ...prev, captainId: currentUser.id, captainName: currentUser.name }));
      }
    }
  }, [editingLog, currentUser]);

  const setNow = (field: 'departureTime' | 'arrivalTime') => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData(prev => ({ ...prev, [field]: now.toISOString().slice(0, 16) }));
  };

  const isFormComplete = !!(
    formData.shipName &&
    formData.captainId &&
    formData.engineerId &&
    formData.departureTime &&
    formData.passengerCount &&
    formData.fuelLevel !== undefined &&
    formData.arrivalTime // Requirement for final "Save"
  );

  const handleSave = (status: 'draft' | 'completed') => {
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
    // Reset if not editing
    if (!editingLog) {
       setFormData({ shipName: '', captainId: currentUser.id, captainName: currentUser.name, engineerId: '', crewIds: [], departureTime: '', arrivalTime: '', passengerCount: 0, fuelLevel: 0, memo: '', status: 'draft' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Edit3 className="text-sky-600" />
          {editingLog ? '운항일지 수정' : '배 운항 정보 입력'}
        </h1>
        <p className="text-slate-500">모바일에서 엄지손가락으로 쉽게 입력하세요</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Step 1: Vessel & Captain */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Anchor size={18} /> 배 이름 선택
            </span>
            <select 
              value={formData.shipName} 
              onChange={(e) => setFormData({...formData, shipName: e.target.value})}
              className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg appearance-none"
            >
              <option value="">선박 선택...</option>
              {ships.map(s => <option key={s.id} value={s.name}>{s.name} (정원: {s.capacity})</option>)}
            </select>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                <Users size={18} /> 기관장
              </span>
              <select 
                value={formData.engineerId} 
                onChange={(e) => setFormData({...formData, engineerId: e.target.value})}
                className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg"
              >
                <option value="">기관장 선택...</option>
                {engineers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                <Users size={18} /> 승무원 (다중선택 가능)
              </span>
              <select 
                multiple
                value={formData.crewIds} 
                onChange={(e) => {
                  // Explicitly cast to HTMLOptionElement to fix TS error on 'value'
                  const options = Array.from(e.target.selectedOptions).map(o => (o as HTMLOptionElement).value);
                  setFormData({...formData, crewIds: options});
                }}
                className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 min-h-[100px]"
              >
                {crews.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Step 2: Timing */}
        <div className="space-y-4">
          <div>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Clock size={18} /> 출발 시간
            </span>
            <div className="flex gap-2">
              <input 
                type="datetime-local" 
                value={formData.departureTime}
                onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                className="flex-1 p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg" 
              />
              <button 
                onClick={() => setNow('departureTime')}
                className="px-6 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl transition-colors"
              >
                지금
              </button>
            </div>
          </div>

          <div>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Clock size={18} /> 도착 시간
            </span>
            <div className="flex gap-2">
              <input 
                type="datetime-local" 
                value={formData.arrivalTime}
                onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                className="flex-1 p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg" 
              />
              <button 
                onClick={() => setNow('arrivalTime')}
                className="px-6 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl transition-colors"
              >
                지금
              </button>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Step 3: Logistics */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Users size={18} /> 승선 인원
            </span>
            <input 
              type="number" 
              inputMode="numeric"
              value={formData.passengerCount}
              onChange={(e) => setFormData({...formData, passengerCount: Number(e.target.value)})}
              placeholder="0"
              className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Fuel size={18} /> 유류 현황 (%)
            </span>
            <input 
              type="number" 
              inputMode="numeric"
              value={formData.fuelLevel}
              onChange={(e) => setFormData({...formData, fuelLevel: Number(e.target.value)})}
              placeholder="0"
              className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
            기타 특이사항 (메모)
          </span>
          <textarea 
            rows={3}
            value={formData.memo}
            onChange={(e) => setFormData({...formData, memo: e.target.value})}
            placeholder="기상 상태, 장비 점검 등..."
            className="w-full p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-lg"
          ></textarea>
        </label>
      </div>

      {/* Buttons */}
      <div className="fixed bottom-0 left-0 right-0 md:relative p-4 md:p-0 bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-t-0 border-slate-200 flex flex-col gap-3">
        <div className="flex gap-4">
          <button 
            onClick={() => handleSave('draft')}
            className="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <AlertCircle size={20} /> 임시 저장
          </button>
          <button 
            disabled={!isFormComplete}
            onClick={() => handleSave('completed')}
            className={`flex-[2] py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-200 ${
              isFormComplete ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle size={20} /> 운항일지 제출
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogEntry;
