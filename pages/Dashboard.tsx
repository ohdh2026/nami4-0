
import React, { useMemo } from 'react';
import { Ship, OperationLog, WeatherInfo } from '../types';
import { 
  Activity, Anchor, Users, Fuel, Clock, ArrowRight, BarChart3, 
  ArrowLeftRight, TrendingUp, Info, Cloud, Wind, Droplets, Thermometer, ExternalLink, RefreshCcw
} from 'lucide-react';

interface DashboardProps {
  logs: OperationLog[];
  ships: Ship[];
  weather: WeatherInfo | null;
  onNavigateToLog: (logId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, ships, weather, onNavigateToLog }) => {
  const inTransitLogs = logs.filter(l => l.departureTime && !l.arrivalTime);
  const todayStr = new Date().toISOString().split('T')[0];
  const completedLogsToday = logs.filter(l => l.arrivalTime && l.arrivalTime.startsWith(todayStr));
  
  const totalPassengersToday = completedLogsToday.reduce((sum, l) => sum + l.passengerCount, 0);

  const { detailedStats, chartData } = useMemo(() => {
    const stats: Record<string, { ab: number; ba: number; others: number; total: number }> = {};
    logs.filter(l => l.departureTime.startsWith(todayStr)).forEach(log => {
      const hour = log.departureTime.split('T')[1].split(':')[0] + ':00';
      const route = `${log.departureLocation}->${log.arrivalLocation}`;
      if (!stats[hour]) stats[hour] = { ab: 0, ba: 0, others: 0, total: 0 };
      if (route === 'A->B') stats[hour].ab += log.passengerCount;
      else if (route === 'B->A') stats[hour].ba += log.passengerCount;
      else stats[hour].others += log.passengerCount;
      stats[hour].total += log.passengerCount;
    });

    const sortedStats = Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0]));
    const chartHours = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const chartPoints = chartHours.map(h => ({
      hour: h,
      ab: stats[h]?.ab || 0,
      ba: stats[h]?.ba || 0
    }));
    return { detailedStats: sortedStats, chartData: chartPoints };
  }, [logs, todayStr]);

  const currentHour = new Date().getHours() + ':00';

  const chartWidth = 1000;
  const chartHeight = 350;
  const paddingX = 60;
  const paddingY = 50;
  
  const maxVal = Math.max(...chartData.map(d => Math.max(d.ab, d.ba)), 50);
  const getY = (val: number) => chartHeight - (val / maxVal) * (chartHeight - paddingY * 2) - paddingY;
  const getX = (idx: number) => (idx / (chartData.length - 1)) * (chartWidth - paddingX * 2) + paddingX;

  const createCurvedPath = (dataKey: 'ab' | 'ba') => {
    if (chartData.length === 0) return "";
    let path = `M ${getX(0)} ${getY(chartData[0][dataKey])}`;
    for (let i = 0; i < chartData.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(chartData[i][dataKey]);
      const x2 = getX(i + 1);
      const y2 = getY(chartData[i + 1][dataKey]);
      const cp1x = x1 + (x2 - x1) / 2;
      const cp2x = x1 + (x2 - x1) / 2;
      path += ` C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
    }
    return path;
  };

  const abCurvedPath = createCurvedPath('ab');
  const baCurvedPath = createCurvedPath('ba');

  const isWindy = weather ? (parseFloat(weather.windSpeed) >= 10) : false;

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">운항 관제 대시보드</h1>
          <p className="text-slate-500 font-medium">나미나라공화국 실시간 선박 관제 및 승선 추이 분석</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-2xl border border-sky-100 shadow-sm animate-pulse">
          <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
          실시간 데이터 동기화 중 ({new Date().toLocaleTimeString()})
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Cloud size={180} />
           </div>
           
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                   <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-sky-400 border border-white/5 mb-2">
                      Local Weather: Nami Island
                   </span>
                   <h2 className="text-xl font-black">실시간 기상 관제</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.location.reload()} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors" title="새로고침">
                    <RefreshCcw size={18} className="text-slate-400" />
                  </button>
                  <a href="https://www.naver.com" target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <ExternalLink size={18} className="text-slate-400" />
                  </a>
                </div>
              </div>

              {weather ? (
                <div className="py-8 flex items-center gap-10">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-sky-500/20 rounded-3xl border border-sky-500/30">
                        <Thermometer size={48} className="text-sky-400" />
                     </div>
                     <div>
                        <p className="text-5xl font-black tracking-tighter">{weather.temp}</p>
                        <p className="text-slate-400 font-bold">{weather.condition}</p>
                     </div>
                  </div>
                  <div className="h-16 w-px bg-white/10 hidden sm:block"></div>
                  <div className="grid grid-cols-2 gap-6 flex-1">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-slate-400">
                          <Wind size={14} />
                          <span className="text-[10px] font-black uppercase">Wind</span>
                       </div>
                       <p className={`text-lg font-black ${isWindy ? 'text-orange-400 animate-pulse' : 'text-white'}`}>{weather.windSpeed}</p>
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-slate-400">
                          <Droplets size={14} />
                          <span className="text-[10px] font-black uppercase">Humidity</span>
                       </div>
                       <p className="text-lg font-black">{weather.humidity}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 font-bold italic gap-4">
                   <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
                   기상 정보를 불러오는 중입니다...
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                 <p className="text-[11px] font-bold text-slate-500 italic">
                   Source: NAVER (Update: {weather?.lastUpdated || '-'})
                 </p>
                 {isWindy && (
                   <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-black animate-bounce border border-red-500/30">
                      강풍 주의: 운항 검토 필요
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:col-span-2">
            <div className="grid grid-cols-2 gap-6 h-full">
              {[
                { label: '운항 중인 선박', val: `${inTransitLogs.length}척`, icon: Activity, color: 'blue', tag: 'Live' },
                { label: '오늘 총 승선객', val: `${totalPassengersToday.toLocaleString()}명`, icon: Users, color: 'green', tag: 'Today' },
                { label: '오늘 운항 횟수', val: `${completedLogsToday.length}회`, icon: Clock, color: 'purple', tag: 'Today' },
                { label: '관리 선박', val: `${ships.length}척`, icon: Anchor, color: 'slate', tag: 'Total' }
              ].map((card, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 bg-${card.color}-50 text-${card.color}-600 rounded-xl`}>
                      <card.icon size={20}/>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 bg-${card.color}-100 text-${card.color}-700 rounded uppercase`}>
                      {card.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-slate-400 text-[11px] font-bold">{card.label}</h3>
                    <p className="text-2xl font-black text-slate-900">{card.val}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <ArrowLeftRight size={20} className="text-sky-600" />
                </div>
                <h2 className="text-lg font-black text-slate-800">시간대별 노선 현황</h2>
              </div>
              <div className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-tighter">
                {todayStr}
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-400 bg-slate-50/50 uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-5 text-left">Time Slot</th>
                    <th className="px-4 py-5 text-center text-blue-600">A → B (가평)</th>
                    <th className="px-4 py-5 text-center text-orange-600">B → A (남이)</th>
                    <th className="px-4 py-5 text-center">Etc</th>
                    <th className="px-6 py-5 text-right text-slate-900">Hourly Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {detailedStats.length > 0 ? detailedStats.map(([hour, s]) => (
                    <tr key={hour} className={`group hover:bg-slate-50/50 transition-colors ${hour === currentHour ? 'bg-sky-50/50' : ''}`}>
                      <td className="px-6 py-5 font-mono font-black text-slate-700">
                        {hour}
                        {hour === currentHour && <span className="ml-2 inline-block w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></span>}
                      </td>
                      <td className={`px-4 py-5 text-center font-mono font-bold ${s.ab > 0 ? 'text-blue-600' : 'text-slate-200'}`}>{s.ab > 0 ? s.ab.toLocaleString() : '-'}</td>
                      <td className={`px-4 py-5 text-center font-mono font-bold ${s.ba > 0 ? 'text-orange-600' : 'text-slate-200'}`}>{s.ba > 0 ? s.ba.toLocaleString() : '-'}</td>
                      <td className={`px-4 py-5 text-center font-mono ${s.others > 0 ? 'text-slate-500' : 'text-slate-200'}`}>{s.others > 0 ? s.others.toLocaleString() : '-'}</td>
                      <td className="px-6 py-5 text-right font-mono font-black text-slate-900 group-hover:scale-110 transition-transform origin-right">{s.total.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="py-32 text-center text-slate-300 font-bold italic">운항 데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              실시간 운항
            </h2>
          </div>
          
          <div className="space-y-4">
            {inTransitLogs.length > 0 ? (
              inTransitLogs.map(log => (
                <button key={log.id} onClick={() => onNavigateToLog(log.id)} className="w-full bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-sky-400 hover:shadow-lg transition-all text-left group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Anchor size={20} />
                      </div>
                      <h4 className="font-black text-slate-900">{log.shipName}</h4>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <div className="bg-slate-50 px-3 py-2 rounded-xl flex-1">
                      <p className="text-slate-400 text-[10px] mb-1">Route</p>
                      <p>{log.departureLocation} → {log.arrivalLocation}</p>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-xl flex-1">
                      <p className="text-blue-400 text-[10px] mb-1">Pax</p>
                      <p className="text-blue-600">{log.passengerCount}명</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                <Anchor size={40} className="mb-4 opacity-10" />
                <p className="font-bold">현재 운항 중인 선박이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
