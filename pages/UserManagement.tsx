
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserCheck, ShieldCheck, Mail, Phone, Plus, Trash2, Edit2, MessageCircle } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onSave: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({ name: '', role: UserRole.CREW, phone: '', telegramChatId: '' });

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentUser.name || !currentUser.phone) return;
    onSave({
      id: currentUser.id || `u-${Date.now()}`,
      name: currentUser.name!,
      role: (currentUser.role as UserRole) || UserRole.CREW,
      phone: currentUser.phone!,
      joinDate: currentUser.joinDate || new Date().toISOString().split('T')[0],
      telegramChatId: currentUser.telegramChatId
    });
    setIsEditing(false);
    setCurrentUser({ name: '', role: UserRole.CREW, phone: '', telegramChatId: '' });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">인력 관리</h1>
          <p className="text-slate-500">선장, 기관장 및 승무원 데이터베이스</p>
        </div>
        <button 
          onClick={() => {setCurrentUser({ name: '', role: UserRole.CREW, phone: '', telegramChatId: '' }); setIsEditing(true);}}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-sky-700"
        >
          <Plus size={20} /> 신규 회원 추가
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">등급/이름</th>
                <th className="p-4">연락처</th>
                <th className="p-4">Telegram ID</th>
                <th className="p-4 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' :
                        u.role === UserRole.CAPTAIN ? 'bg-blue-100 text-blue-600' :
                        u.role === UserRole.CHIEF_ENGINEER ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role === UserRole.ADMIN ? <ShieldCheck size={16}/> : <UserCheck size={16}/>}
                      </div>
                      <div>
                        <div className="font-bold">{u.name}</div>
                        <div className="text-[10px] uppercase font-black text-slate-400">{u.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{u.phone}</td>
                  <td className="p-4">
                    {u.telegramChatId ? (
                      <div className="flex items-center gap-1 text-sky-600 text-xs font-mono">
                        <MessageCircle size={14} /> {u.telegramChatId}
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(u)} className="p-1 text-slate-400 hover:text-sky-600"><Edit2 size={16}/></button>
                      <button onClick={() => onDelete(u.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Panel */}
        {isEditing && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-sky-100 space-y-4 h-fit sticky top-6">
            <h3 className="font-bold text-lg">{currentUser.id ? '회원 정보 수정' : '신규 회원 추가'}</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">이름</span>
                <input 
                  type="text" 
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">등급</span>
                <select 
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                  className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">연락처</span>
                <input 
                  type="tel" 
                  value={currentUser.phone}
                  onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="010-0000-0000"
                />
              </label>

              <label className="block">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Telegram ChatID</span>
                  <span className="text-[10px] text-sky-500 font-bold">@userinfobot을 통해 확인</span>
                </div>
                <input 
                  type="text" 
                  value={currentUser.telegramChatId}
                  onChange={(e) => setCurrentUser({...currentUser, telegramChatId: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono"
                  placeholder="숫자만 입력"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-slate-100 font-bold rounded-lg"
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-lg"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
