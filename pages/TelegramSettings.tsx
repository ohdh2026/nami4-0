
import React, { useState } from 'react';
import { Bot, Send, Users, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User, TelegramConfig } from '../types';

interface TelegramSettingsProps {
  users: User[];
  config: TelegramConfig;
  onSaveConfig: (config: TelegramConfig) => void;
}

const TelegramSettings: React.FC<TelegramSettingsProps> = ({ users, config, onSaveConfig }) => {
  const [token, setToken] = useState(config.botToken);
  const [showToken, setShowToken] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(config.recipients);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const usersWithTelegram = users.filter(u => !!u.telegramChatId);

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSaveConfig = () => {
    onSaveConfig({ botToken: token, recipients: selectedUsers });
    alert('설정이 저장되었습니다.');
  };

  const handleSendMessage = async () => {
    if (!message || selectedUsers.length === 0) return;
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setMessage('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  const quickTemplates = [
    "기상 악화로 인한 운항 주의 바람.",
    "즉시 선박 상태 보고 바랍니다.",
    "금일 일계표 작성 완료 부탁드립니다.",
    "비상 상황: 즉시 대기 바랍니다."
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Send className="text-sky-600" /> Telegram 알림 설정
        </h1>
        <p className="text-slate-500">봇 API 관리 및 단체 메시지 발송</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Bot Config */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bot size={20} className="text-slate-400" /> Bot 구성
            </h2>
            
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Bot Token (API Key)</span>
              <div className="relative mt-2">
                <input 
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono text-sm"
                  placeholder="BotFather에게 받은 토큰 입력"
                />
                <button 
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-4 top-4 text-slate-400"
                >
                  {showToken ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </label>

            <button 
              onClick={() => alert('봇 연결 테스트 중... (시뮬레이션)')}
              className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              연결 테스트
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users size={20} className="text-slate-400" /> 수신자 선택 ({selectedUsers.length}명)
            </h2>
            <p className="text-xs text-slate-500">Telegram ChatID가 등록된 회원만 표시됩니다.</p>
            
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {usersWithTelegram.map(u => (
                <button 
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedUsers.includes(u.id) ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {selectedUsers.includes(u.id) ? <CheckCircle2 size={16}/> : <Users size={16}/>}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">{u.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{u.role}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-400">{u.telegramChatId}</div>
                </button>
              ))}
            </div>

            <button 
              onClick={handleSaveConfig}
              className="w-full py-4 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:bg-sky-700"
            >
              설정 저장
            </button>
          </div>
        </section>

        {/* Right: Messaging */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 h-fit">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Send size={20} className="text-slate-400" /> 단체 메시지 발송
          </h2>
          
          <div className="bg-sky-50 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="text-sky-600 shrink-0" />
            <p className="text-xs text-sky-800 leading-relaxed">
              선택된 수신자들에게 텔레그램 메시지를 실시간으로 발송합니다. 
              <strong>{selectedUsers.length}명</strong>에게 발송될 예정입니다.
            </p>
          </div>

          <div className="space-y-4">
            <textarea 
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 resize-none"
              placeholder="메시지 내용을 입력하세요..."
            ></textarea>

            <div className="flex flex-wrap gap-2">
              {quickTemplates.map(t => (
                <button 
                  key={t}
                  onClick={() => setMessage(t)}
                  className="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-full hover:bg-sky-100 hover:text-sky-700 border border-slate-200"
                >
                  {t}
                </button>
              ))}
            </div>

            <button 
              disabled={!message || selectedUsers.length === 0 || status === 'loading'}
              onClick={handleSendMessage}
              className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                status === 'loading' ? 'bg-slate-100 text-slate-400' :
                status === 'success' ? 'bg-green-500 text-white' :
                'bg-sky-600 text-white shadow-lg shadow-sky-200 hover:bg-sky-700'
              }`}
            >
              {status === 'loading' ? '전송 중...' : 
               status === 'success' ? <><CheckCircle2 size={20}/> 전송 성공</> : 
               <><Send size={20}/> 메시지 일괄 발송</>}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TelegramSettings;
