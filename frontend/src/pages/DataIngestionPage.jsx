import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  UploadCloud, FileText, Table, FileCode, CheckCircle2, 
  AlertCircle, ArrowRight, RefreshCw, Sparkles, Clock, 
  Layers, UserCheck, ShieldCheck, Eye 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DataIngestionPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentExtractedEvents, setRecentExtractedEvents] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'history'
  const { showNotification } = useApp();

  const fetchDocuments = async () => {
    try {
      const res = await api.getDocuments();
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', 'Site Engineer');

    try {
      const res = await api.uploadDocument(formData);
      if (res.success) {
        showNotification(`File "${file.name}" uploaded and parsed successfully!`, 'success');
        setRecentExtractedEvents(res.events || []);
        fetchDocuments();
      } else {
        showNotification(res.error || 'Upload failed', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'File upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleLoad = async (sampleType) => {
    setLoading(true);
    try {
      const res = await api.loadSampleDocument(sampleType);
      if (res.success) {
        showNotification(`Sample loaded: ${res.document?.filename}`, 'success');
        setRecentExtractedEvents(res.events || []);
        fetchDocuments();
      } else {
        showNotification('Failed to load sample', 'error');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Heterogeneous Data Ingestion Layer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest unstructured daily progress reports, discipline spreadsheets, and scanned site diaries into normalized execution events.
          </p>
        </div>

        {/* Sample Data Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo:
          </span>
          <button
            onClick={() => handleSampleLoad('daily-report')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            Load Sample Daily Report
          </button>
          <button
            onClick={() => handleSampleLoad('spreadsheet')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            Load Sample Discipline Spreadsheet
          </button>
          <button
            onClick={() => handleSampleLoad('site-diary')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            Load Sample Site Diary
          </button>
        </div>
      </div>

      {/* Main Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Drop Zone (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white flex flex-col items-center justify-center min-h-[240px] relative ${
              dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".txt,.csv,.xlsx,.xls,.pdf"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              {loading ? (
                <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-800">
              {loading ? 'Processing Document & Extracting Activity Nodes...' : 'Drag & Drop Execution Data Files Here'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
              Supports Free-text Daily Reports (<code className="text-blue-700">.txt</code>), Discipline Spreadsheets (<code className="text-emerald-700">.csv, .xlsx</code>), and Site Diary Logs (<code className="text-rose-700">.pdf</code>).
            </p>

            <label
              htmlFor="file-upload"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer transition-all inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Browse Local Files
            </label>
          </div>

          {/* Sample Format Specification cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Format 1: Free Text DPR
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Natural paragraphs with discipline headers, start/end dates, timestamps & supervisor.
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                Format 2: Excel / CSV
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Smart mapping for alternate headers: "Task", "Work Description", "Job", "Start Date".
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <FileCode className="w-3.5 h-3.5 text-purple-600" />
                Format 3: PDF Site Diary
              </span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Text stream extraction with automated fallback alerts for non-OCR scans.
              </p>
            </div>
          </div>
        </div>

        {/* Ingestion Info Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Extraction Pipeline Features</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">Active</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Multi-format timestamp regex (DD Month YYYY, DD/MM/YYYY, HH:MM AM/PM)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Discipline entity recognition (Piping, Civil, Electrical, HSE, Mechanical)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Intelligent synonym normalization (erected → erect, poured → pour)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Immediate handoff to AI Schedule-Linking Engine</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/match-review"
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              Go to Match Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Extracted Records Table (if available) */}
      {recentExtractedEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fade-in">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                Latest Extraction Results ({recentExtractedEvents.length} events detected)
              </span>
            </div>
            <Link
              to="/match-review"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Verify Matches in Review Queue →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Discipline</th>
                  <th className="px-4 py-3">Extracted Activity Description</th>
                  <th className="px-4 py-3">Actual Start</th>
                  <th className="px-4 py-3">Actual End</th>
                  <th className="px-4 py-3">Supervisor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Suggested Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExtractedEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-blue-50 text-blue-700">
                        {evt.discipline}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {evt.activity_description}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {evt.actual_start || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {evt.actual_end || 'In Progress'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {evt.supervisor}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {evt.suggested_activity_id ? (
                        <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[11px]">
                          {evt.suggested_activity_id} ({Math.round(evt.confidence * 100)}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">Review Required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Uploaded Documents History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Document Upload & Extraction History</h2>
          <span className="text-xs text-slate-400">{documents.length} ingested files</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Discipline</th>
                <th className="px-4 py-3">Upload Time</th>
                <th className="px-4 py-3">Records Extracted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Preview Snippet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    No documents ingested yet. Upload a file or click one of the sample buttons above.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                      {doc.file_type === 'TXT' && <FileText className="w-4 h-4 text-blue-500" />}
                      {doc.file_type === 'CSV' && <Table className="w-4 h-4 text-emerald-500" />}
                      {doc.file_type === 'XLSX' && <Table className="w-4 h-4 text-emerald-600" />}
                      {doc.file_type === 'PDF' && <FileCode className="w-4 h-4 text-rose-500" />}
                      <span>{doc.filename}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {doc.file_type}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {doc.discipline || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {new Date(doc.upload_time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">
                      {doc.records_extracted || 0} events
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {doc.processing_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 max-w-xs truncate text-[11px]">
                      {doc.extracted_preview || 'Parsed document stream'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
