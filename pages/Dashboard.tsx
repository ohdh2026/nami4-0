
import React from 'react';
import { Ship, OperationLog } from '../types';
import { Activity, Anchor, Users, Fuel, Clock, ArrowRight, MapPin, BarChart3, ArrowLeftRight } from 'lucide-react';

interface DashboardProps {
  logs: OperationLog[];
  ships: Ship[];
  onNavigateToLog: (logId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, ships, onNavigateToLog }) => {
  const inTransitLogs = logs.filter(l => l.departureTime && !l.arrivalTime);
  const todayStr = new Date().toISOString().split('T')[0];
  const completedLogsToday = logs.filter(l => l.arrivalTime && l.arrivalTime.startsWith(todayStr));
  
  const totalPassengersToday = completedLogsToday.reduce((sum, l) => sum + l.passengerCount, 0);

  // 노선별 시간대별 상세 통계 집계
  const getDetailedHourlyStats = () => {
    const stats: Record<string, { ab: number; ba: number; others: number; total: number }> = {};
    
    // 오늘 기록만 대상
    logs.filter(l => l.departureTime.startsWith(todayStr)).forEach(log => {
      const hour = log.departureTime.split('T')[1].split(':')[0] + ':00';
      const route = `${log.departureLocation}->${log.arrivalLocation}`;

      if (!stats[hour]) {
        stats[hour] = { ab: 0, ba: 0, others: 0, total: 0 };
      }

      if (route === 'A->B') {
        stats[hour].ab += log.passengerCount;
      } else if (route === 'B->A') {
        stats[hour].ba += log.passengerCount;
      } else {
        stats[hour].others += log.passengerCount;
      }
      stats[hour].total += log.passengerCount;
    });

    // 시간 순 정렬 (최신 시간이 위로)
    return Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const detailedStats = getDetailedHourlyStats();
  const currentHour = new Date().getHours() + ':00';

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">운항 현황판</h1>
          <p className="text-slate-500">실시간 선박 운항 상태 및 노선별 상세 통계</p>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          업데이트: {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* 상단 주요 지표 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24}/></div>
            <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">실시간</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">운항 중인 선박</h3>
          <p className="text-3xl font-bold mt-1">{inTransitLogs.length}척</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users size={24}/></div>
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">Today</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">오늘 총 승선객</h3>
          <p className="text-3xl font-bold mt-1">{totalPassengersToday.toLocaleString()}명</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Clock size={24}/></div>
            <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Today</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">오늘 운항 횟수</h3>
          <p className="text-3xl font-bold mt-1">{completedLogsToday.length}회</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Fuel size={24}/></div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">관리 대상 선박</h3>
          <p className="text-3xl font-bold mt-1">{ships.length}척</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 노선별 상세 시간대 통계 (A->B, B->A 구분) */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ArrowLeftRight size={20} className="text-sky-600" />
                노선별 시간대 상세 현황
              </h2>
              <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>오늘: {todayStr}</span>
                <span>단위: 명</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">시간대</th>
                    <th className="px-4 py-4 text-center font-bold bg-blue-50/30 text-blue-700">A → B (가평방면)</th>
                    <th className="px-4 py-4 text-center font-bold bg-orange-50/30 text-orange-700">B → A (남이방면)</th>
                    <th className="px-4 py-4 text-center font-bold text-slate-400">기타 노선</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-900">시간 합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {detailedStats.length > 0 ? detailedStats.map(([hour, s]) => (
                    <tr key={hour} className={`hover:bg-slate-50/80 transition-colors ${hour === currentHour ? 'bg-sky-50 ring-1 ring-inset ring-sky-100' : ''}`}>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 flex items-center gap-2">
                        {hour}
                        {hour === currentHour && <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>}
                      </td>
                      <td className={`px-4 py-4 text-center font-mono font-bold ${s.ab > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                        {s.ab.toLocaleString()}
                      </td>
                      <td className={`px-4 py-4 text-center font-mono font-bold ${s.ba > 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                        {s.ba.toLocaleString()}
                      </td>
                      <td className={`px-4 py-4 text-center font-mono ${s.others > 0 ? 'text-slate-600' : 'text-slate-300'}`}>
                        {s.others.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-slate-900 bg-slate-50/30">
                        {s.total.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-24 text-center text-slate-400 italic">
                        오늘 기록된 운항 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {detailedStats.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
                    * 출발 시간(Departure Time) 기준으로 자동 집계됩니다.
                </div>
            )}
          </section>
        </div>

        {/* 실시간 운항 선박 (우측 사이드) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-bold text-slate-900">실시간 운항 정보</h2>
          </div>
          
          <div className="space-y-3">
            {inTransitLogs.length > 0 ? (
              inTransitLogs.map(log => (
                <button
                  key={log.id}
                  onClick={() => onNavigateToLog(log.id)}
                  className="w-full group bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-left hover:border-sky-500 transition-all"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Anchor size={18} />
                      </div>
                      <h4 className="font-bold text-slate-900">{log.shipName}</h4>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-500" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-slate-400 mb-1">노선</p>
                      <p className="font-bold">{log.departureLocation} → {log.arrivalLocation}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-slate-400 mb-1">인원</p>
                      <p className="font-bold text-blue-600">{log.passengerCount}명</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-sm">
                <Anchor size={32} className="mb-2 opacity-20" />
                <p>현재 운항 중인 선박 없음</p>
              </div>
            )}
          </div>

          {/* 선박별 정원 요약 (사이드 하단) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 size={16} /> 선박 정원 요약
            </h3>
            <div className="space-y-4">
              {ships.slice(0, 4).map(ship => {
                const currentTransit = inTransitLogs.find(l => l.shipName === ship.name);
                const ratio = currentTransit ? (currentTransit.passengerCount / ship.capacity) * 100 : 0;
                return (
                  <div key={ship.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-700">{ship.name}</span>
                      <span className={ratio > 90 ? 'text-red-500' : 'text-slate-400'}>{Math.round(ratio)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${ratio > 90 ? 'bg-red-500' : 'bg-sky-500'}`} 
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
