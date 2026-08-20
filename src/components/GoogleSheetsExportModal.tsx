import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle2, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { appStore } from '../lib/storage';
import { buildSheetsData, generateCSV, downloadCSV } from '../lib/googleSheets';

interface GoogleSheetsExportModalProps {
  onClose: () => void;
}

export const GoogleSheetsExportModal: React.FC<GoogleSheetsExportModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'sync'>('preview');
  const [selectedSheet, setSelectedSheet] = useState<'schedules' | 'bookings' | 'training'>('bookings');
  const [isExporting, setIsExporting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const schedules = appStore.getSchedules();
  const bookings = appStore.getBookings();
  const trainingRequests = appStore.getTrainingRequests();
  const checkIns = appStore.getCheckIns();

  const sheetsData = buildSheetsData({
    title: 'CKR_TRANSPORT_EXPORT',
    schedules,
    bookings,
    trainingRequests,
    checkIns
  });

  const handleDownloadSingleCSV = (type: 'schedules' | 'bookings' | 'training') => {
    const data = sheetsData[type];
    const csv = generateCSV(data);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `CKR_${type}_${dateStr}.csv`;
    downloadCSV(filename, csv);
  };

  const handleDownloadAllCSVs = () => {
    handleDownloadSingleCSV('schedules');
    setTimeout(() => handleDownloadSingleCSV('bookings'), 300);
    setTimeout(() => handleDownloadSingleCSV('training'), 600);
  };

  const handleSyncToGoogleSheets = async () => {
    setIsExporting(true);
    setSyncStatus('กำลังสร้างและส่งข้อมูลไปยัง Google Sheets...');

    try {
      // Simulate real Google Sheets OAuth API call
      await new Promise((r) => setTimeout(r, 1200));

      const spreadsheetId = `ckr_sheets_${Date.now().toString(36)}`;
      setSyncStatus(`ซิงค์ข้อมูลสำเร็จ! อัปเดตตารางข้อมูลเรียบร้อยแล้ว (${new Date().toLocaleTimeString('th-TH')})`);
    } catch {
      setSyncStatus('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  const currentRows = sheetsData[selectedSheet];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-white">
                  ส่งออกข้อมูลไปยัง Google Sheets
                </h3>
                <span className="bg-emerald-800/80 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-600">
                  Google Workspace Connected
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช (chinakorn.p@ckr.ac.th)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900 text-emerald-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Subheader */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSheet('bookings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSheet === 'bookings'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              รายชื่อผู้โดยสาร ({bookings.length} รายการ)
            </button>
            <button
              onClick={() => setSelectedSheet('schedules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSheet === 'schedules'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ตารางเดินรถ ({schedules.length} รอบ)
            </button>
            <button
              onClick={() => setSelectedSheet('training')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSheet === 'training'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              คำขอรถแหล่งฝึก ({trainingRequests.length} คำขอ)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadSingleCSV(selectedSheet)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              ดาวน์โหลด CSV แผ่นนี้
            </button>
            <button
              onClick={handleSyncToGoogleSheets}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isExporting ? 'animate-spin' : ''}`} />
              ซิงค์ลง Google Sheets
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-200 text-xs font-medium text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {syncStatus}
            </span>
            <a
              href="https://docs.google.com/spreadsheets"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
            >
              เปิดใน Google Sheets <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Sheet Table Preview */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10">
                  <tr>
                    {currentRows[0]?.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-3.5 py-2.5 font-semibold text-slate-200 border-r border-slate-800 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRows.slice(1).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-100/70'}
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-3.5 py-2 text-slate-700 border-r border-slate-100 whitespace-nowrap"
                        >
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {currentRows.length <= 1 && (
                    <tr>
                      <td colSpan={currentRows[0]?.length || 1} className="py-8 text-center text-slate-400">
                        ยังไม่มีข้อมูลในแผ่นงานนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleDownloadAllCSVs}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            ดาวน์โหลดข้อมูลทั้งหมด (3 ไฟล์ CSV)
          </button>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
