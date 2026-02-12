
import React from 'react';
import { Ship, OperationLog, PageView } from '../types';
import { Activity, Anchor, Users, Fuel, Clock, ArrowRight } from 'lucide-react';

interface DashboardProps {
  logs: OperationLog[];
  ships: Ship[];
  onNavigateToLog: (logId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, ships, onNavigateToLog }) => {
  const inTransitLogs = logs.filter(l => l.departureTime && !l.arrivalTime);
  const completedLogsToday = logs.filter(l => l.arrivalTime && l.arrivalTime.startsWith(new Date().toISOString().split('T')[0]));
  
  const totalPassengersToday = completedLogsToday.reduce((sum, l) => sum + l.passengerCount, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">운항 현황판</h1>
          <p className="text-slate-500">실시간 선박 운항 상태 및 통계</p>
        </div>
        <div className="text-sm font-medium text-slate-400">
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* Stats Grid */}
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

      {/* Active Ships */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-bold">운항 중인 배 목록</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inTransitLogs.length > 0 ? (
            inTransitLogs.map(log => (
              <button
                key={log.id}
                onClick={() => onNavigateToLog(log.id)}
                className="group bg-white p-5 rounded-xl shadow-sm border border-slate-200 text-left hover:border-sky-500 transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Anchor size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{log.shipName}</h4>
                      <p className="text-xs text-slate-500">선장: {log.captainName}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-sky-500 transform group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">출발 시간</span>
                    <span className="font-semibold text-slate-900">{log.departureTime.split('T')[1]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">승선 인원</span>
                    <span className="font-semibold text-slate-900">{log.passengerCount}명</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Anchor size={48} className="mb-2 opacity-20" />
              <p>현재 운항 중인 배가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Ships Capacity Overview */}
      <section>
        <h2 className="text-lg font-bold mb-4">선박별 정원 상태</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ships.map(ship => {
            const currentTransit = inTransitLogs.find(l => l.shipName === ship.name);
            const ratio = currentTransit ? (currentTransit.passengerCount / ship.capacity) * 100 : 0;
            const statusColor = ratio > 95 ? 'bg-red-500' : ratio > 80 ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <div key={ship.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between mb-3">
                  <span className="font-bold">{ship.name}</span>
                  <span className="text-xs text-slate-500">정원: {ship.capacity}명</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-1000 ${statusColor}`} 
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={ratio > 95 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                    현재: {currentTransit ? `${currentTransit.passengerCount}명` : '정박 중'}
                  </span>
                  <span className="font-bold">{Math.round(ratio)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
