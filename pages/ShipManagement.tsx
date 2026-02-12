
import React, { useState } from 'react';
import { Ship } from '../types';
import { Anchor, Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';

interface ShipManagementProps {
  ships: Ship[];
  onSave: (ship: Ship) => void;
  onDelete: (id: string) => void;
}

const ShipManagement: React.FC<ShipManagementProps> = ({ ships, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentShip, setCurrentShip] = useState<Partial<Ship>>({ name: '', capacity: 0 });

  const handleEdit = (ship: Ship) => {
    setCurrentShip(ship);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentShip.name || !currentShip.capacity) return;
    onSave({
      id: currentShip.id || `s-${Date.now()}`,
      name: currentShip.name!,
      capacity: Number(currentShip.capacity)
    });
    setIsEditing(false);
    setCurrentShip({ name: '', capacity: 0 });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">선박 정보 관리</h1>
          <p className="text-slate-500">운항 선박 목록 및 정원 설정</p>
        </div>
        <button 
          onClick={() => {setCurrentShip({ name: '', capacity: 0 }); setIsEditing(true);}}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-sky-700"
        >
          <Plus size={20} /> 선박 추가
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ships.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 group relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center">
                <Anchor size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(s)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-sky-100 hover:text-sky-600"><Edit2 size={16}/></button>
                <button onClick={() => onDelete(s.id)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-red-100 hover:text-red-600"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{s.name}</h3>
            <div className="flex items-center gap-2 text-slate-500 mb-6">
              <TrendingUp size={16} />
              <span>최대 정원: <strong>{s.capacity}명</strong></span>
            </div>
            
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 w-1/3 opacity-30"></div>
            </div>
          </div>
        ))}

        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
              <h3 className="text-xl font-bold">{currentShip.id ? '선박 정보 수정' : '신규 선박 등록'}</h3>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">선박 명칭</span>
                  <input 
                    type="text" 
                    value={currentShip.name}
                    onChange={(e) => setCurrentShip({...currentShip, name: e.target.value})}
                    className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                    placeholder="예: 나미나라호"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">최대 정원 (Capacity)</span>
                  <input 
                    type="number" 
                    value={currentShip.capacity}
                    onChange={(e) => setCurrentShip({...currentShip, capacity: Number(e.target.value)})}
                    className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                    placeholder="0"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 bg-slate-100 font-bold rounded-xl"
                >
                  취소
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-sky-600 text-white font-bold rounded-xl"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipManagement;
