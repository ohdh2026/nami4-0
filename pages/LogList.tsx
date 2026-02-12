
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, FileSpreadsheet, Printer, ChevronRight, 
  Calendar, Ship as ShipIcon, User as UserIcon, CheckSquare, Square, X, Check
} from 'lucide-react';
import { OperationLog, Ship } from '../types';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';

interface LogListProps {
  logs: OperationLog[];
  ships: Ship[];
  onEdit: (log: OperationLog) => void;
  onDelete: (id: string) => void;
}

const LogList: React.FC<LogListProps> = ({ logs, ships, onEdit, onDelete }) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterShip, setFilterShip] = useState('');
  const [filterCaptain, setFilterCaptain] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDate, setPrintDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const dateMatch = !filterDate || log.departureTime.startsWith(filterDate);
      const shipMatch = !filterShip || log.shipName === filterShip;
      const captainMatch = !filterCaptain || log.captainName.toLowerCase().includes(filterCaptain.toLowerCase());
      return dateMatch && shipMatch && captainMatch;
    }).sort((a, b) => b.departureTime.localeCompare(a.departureTime));
  }, [logs, filterDate, filterShip, filterCaptain]);

  const toggleAll = () => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(filteredLogs.map(l => l.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedLogs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const exportToExcel = () => {
    const dataToExport = logs.filter(l => selectedLogs.includes(l.id)).map(l => ({
      '날짜': l.departureTime.split('T')[0],
      '배 이름': l.shipName,
      '선장': l.captainName,
      '기관장': l.engineerName,
      '출발 시간': l.departureTime.split('T')[1],
      '도착 시간': l.arrivalTime ? l.arrivalTime.split('T')[1] : '운항 중',
      '승선 인원': l.passengerCount,
      '유류 현황(%)': l.fuelLevel,
      '특이사항': l.memo
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "운항일지");
    XLSX.writeFile(wb, `운항일지_추출_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const logsToPrint = logs.filter(l => l.departureTime.startsWith(printDate));

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold">운항일지 관리</h1>
          <p className="text-slate-500">(주)남이섬 나미나라공화국 운항 관리 시스템</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <Printer size={18} /> 운항일지 출력
          </button>
          <button 
            disabled={selectedLogs.length === 0}
            onClick={exportToExcel}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLogs.length > 0 ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FileSpreadsheet size={18} /> Excel 추출 ({selectedLogs.length})
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 no-print">
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="relative">
          <ShipIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select 
            value={filterShip}
            onChange={(e) => setFilterShip(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-sky-500 appearance-none"
          >
            <option value="">모든 선박</option>
            {ships.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="relative">
          <UserIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="선장 이름 검색"
            value={filterCaptain}
            onChange={(e) => setFilterCaptain(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button 
          onClick={() => {setFilterDate(''); setFilterShip(''); setFilterCaptain('');}}
          className="py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200"
        >
          필터 초기화
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4 w-10">
                  <button onClick={toggleAll} className="text-sky-600">
                    {selectedLogs.length === filteredLogs.length && filteredLogs.length > 0 
                      ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </th>
                <th className="p-4">날짜/배이름</th>
                <th className="p-4">선장/기관장</th>
                <th className="p-4">출발/도도착</th>
                <th className="p-4">승선/유류</th>
                <th className="p-4">상태</th>
                <th className="p-4 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const isTransit = !log.arrivalTime;
                return (
                  <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${selectedLogs.includes(log.id) ? 'bg-sky-50/50' : ''}`}>
                    <td className="p-4">
                      <button onClick={() => toggleOne(log.id)} className="text-sky-600">
                        {selectedLogs.includes(log.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{log.shipName}</div>
                      <div className="text-xs text-slate-500">{log.departureTime.split('T')[0]}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{log.captainName}</div>
                      <div className="text-xs text-slate-400">Eng: {log.engineerName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900 font-mono text-xs">{log.departureTime.split('T')[1]} ~</div>
                      <div className={`text-xs font-mono ${isTransit ? 'text-green-500 font-bold' : 'text-slate-900'}`}>
                        {isTransit ? '운항 중' : log.arrivalTime.split('T')[1]}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{log.passengerCount}명</div>
                      <div className="text-xs text-slate-400">Fuel: {log.fuelLevel}%</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {log.status === 'completed' ? '제출 완료' : '임시 저장'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onEdit(log)} className="p-1 text-slate-400 hover:text-sky-600 transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">운항 일계표 출력</h2>
              <button onClick={() => setShowPrintModal(false)}><X /></button>
            </div>
            <p className="text-slate-500 text-sm">특정 날짜의 모든 운항 기록을 집계하여 출력용 양식으로 생성합니다.</p>
            <div className="space-y-2">
              <label className="text-sm font-bold">출력 날짜 선택</label>
              <input 
                type="date" 
                value={printDate}
                onChange={(e) => setPrintDate(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 flex items-center gap-3">
              <Check className="flex-shrink-0" />
              선택한 날짜에 총 <strong>{logsToPrint.length}건</strong>의 기록이 있습니다.
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-4 bg-slate-100 font-bold rounded-xl"
              >
                취소
              </button>
              <button 
                onClick={handlePrint}
                className="flex-[2] py-4 bg-sky-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer size={20} /> 인쇄하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-Only Layout */}
      <div className="hidden print-only p-8 max-w-A4 mx-auto bg-white text-black text-xs leading-tight">
        <div className="text-center mb-10 border-b-4 border-black pb-4">
          <h1 className="text-3xl font-black mb-1">운 항 일 계 표</h1>
          <p className="text-lg">나미나라공화국 (주)남이섬</p>
          <div className="flex justify-between mt-6 px-4 font-bold">
            <span>출력 일자: {printDate}</span>
            <div className="flex gap-4">
              <span className="border border-black w-20 h-20 flex flex-col items-center justify-center">담당<br/><br/>(인)</span>
              <span className="border border-black w-20 h-20 flex flex-col items-center justify-center">승인<br/><br/>(인)</span>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-slate-200">
              <th className="border border-black p-2">선박명</th>
              <th className="border border-black p-2">선장/기관장</th>
              <th className="border border-black p-2">출발</th>
              <th className="border border-black p-2">도착</th>
              <th className="border border-black p-2">인원</th>
              <th className="border border-black p-2">유류</th>
              <th className="border border-black p-2 w-1/4">특이사항</th>
            </tr>
          </thead>
          <tbody>
            {logsToPrint.map(l => (
              <tr key={l.id}>
                <td className="border border-black p-2 font-bold text-center">{l.shipName}</td>
                <td className="border border-black p-2 text-center">{l.captainName}<br/>{l.engineerName}</td>
                <td className="border border-black p-2 text-center">{l.departureTime.split('T')[1]}</td>
                <td className="border border-black p-2 text-center">{l.arrivalTime ? l.arrivalTime.split('T')[1] : '-'}</td>
                <td className="border border-black p-2 text-center">{l.passengerCount}명</td>
                <td className="border border-black p-2 text-center">{l.fuelLevel}%</td>
                <td className="border border-black p-2 text-[10px]">{l.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 border-t-2 border-black pt-4">
          <div className="grid grid-cols-2 gap-8 text-sm font-bold">
            <div>
              <p>금일 총 운항: {logsToPrint.length}회</p>
              <p>금일 총 승선객: {logsToPrint.reduce((a, b) => a + b.passengerCount, 0)}명</p>
            </div>
            <div className="text-right italic">
              (주)남이섬 사업자등록번호: 123-45-67890<br/>
              강원특별자치도 춘천시 남산면 남이섬길 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogList;
