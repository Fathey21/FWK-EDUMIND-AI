/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { LectureInput, LectureSummary, FileInputType } from '../types';
import { 
  FileText, UploadCloud, Volume2, Video, FileImage, 
  Sparkles, Check, ChevronLeft, Download, RefreshCw, 
  Trash2, Mic, Square, HelpCircle 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

interface SummarizerPanelProps {
  college: string;
  onSummaryGenerated: (summary: LectureSummary) => void;
  currentSummary: LectureSummary | null;
  setCurrentSummary: (summary: LectureSummary | null) => void;
}

interface UploadedFile {
  fileName: string;
  fileSize: string;
  fileType: FileInputType;
  base64Data?: string;
  rawText?: string;
}

export default function SummarizerPanel({ college, onSummaryGenerated, currentSummary, setCurrentSummary }: SummarizerPanelProps) {
  // Form States
  const [lectureName, setLectureName] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('preferred_academic_lang') || 'العربية');
  const [rawText, setRawText] = useState('');
  const [fileType, setFileType] = useState<FileInputType>('text');
  
  // File upload states
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [base64Data, setBase64Data] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Multi-file state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Mic recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  
  // Processing States
  const [loading, setLoading] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [errorWord, setErrorWord] = useState('');
  const [wordExporting, setWordExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Choose file upload helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        processSelectedFile(file);
      });
    }
  };

  const processSelectedFile = (file: File) => {
    setFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeInMB} MB`);
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    let detectedType: FileInputType = 'text';

    if (ext === 'pdf') {
      detectedType = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      detectedType = 'image';
    } else if (['mp3', 'wav', 'ogg', 'm4a', 'aac', '3gp'].includes(ext || '')) {
      detectedType = 'audio';
    } else if (['mp4', 'mkv', 'avi', 'mov'].includes(ext || '')) {
      detectedType = 'video';
    }

    setFileType(detectedType);

    // Read general text sheets (CSV, txt, json, code, markdown) directly on client as rawText
    if (['csv', 'txt', 'md', 'json', 'py', 'js', 'ts', 'sql', 'html', 'css'].includes(ext || '')) {
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = reader.result as string;
        setUploadedFiles(prev => [
          ...prev,
          {
            fileName: file.name,
            fileSize: `${sizeInMB} MB`,
            fileType: 'text',
            rawText: textContent
          }
        ]);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        setBase64Data(base64String || '');
        setUploadedFiles(prev => [
          ...prev,
          {
            fileName: file.name,
            fileSize: `${sizeInMB} MB`,
            fileType: detectedType,
            base64Data: base64String
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach(file => {
        processSelectedFile(file);
      });
    }
  };

  // Start micro recording
  const startRecording = async () => {
    setRecordedBlobUrl(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlobUrl(url);

        // Convert audio blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setBase64Data(base64String || '');
        };
        reader.readAsDataURL(audioBlob);

        setFileName('تسجيل_محاضرة_مباشر.mp3');
        setFileSize(`${(audioBlob.size / 1024).toFixed(1)} KB`);
        setFileType('audio');

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      alert('لا يمكن الوصول للميكروفون. يرجى إعطاء صلاحية الصوت أو استخدام الرفع التقليدي.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
  };

  const handleClearFile = () => {
    setFileName('');
    setFileSize('');
    setBase64Data('');
    setRecordedBlobUrl(null);
    setFileType('text');
    setUploadedFiles([]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length <= 1) {
      setFileName('');
      setFileSize('');
      setBase64Data('');
    }
  };

  // Trigger main AI calculation
  const handleAISummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert('رجاء كتابة اسم المادة الدراسية أولاً');
      return;
    }

    setLoading(true);
    setProcessStatus('جاري تهيئة خوارزميات الذكاء الاصطناعي الأكاديمية...');
    setErrorWord('');

    try {
      setTimeout(() => setProcessStatus('جاري استيعاب البيانات وقراءة الملفات المرفقة (إن وجدت)...'), 1500);
      setTimeout(() => setProcessStatus('جاري تلخيص المحاضرة وتفكيك المفاهيم العلمية الأساسية...'), 3500);
      setTimeout(() => setProcessStatus('جاري صياغة الأسئلة ومقارنة النظريات وتجهيز الحالات الدراسية...'), 5500);

      const resolvedLectureName = lectureName.trim() || `محاضرة في مادة ${subject.trim()}`;

      const requestBody = {
        lectureName: resolvedLectureName,
        college,
        subject: subject,
        fileType,
        fileName,
        base64Data,
        rawText: fileType === 'text' ? rawText : undefined,
        language,
        files: uploadedFiles
      };

      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('فشلت عملية التلخيص الذكية من الخادم المجمع');
      }

      const summaryResult: LectureSummary = await response.json();
      onSummaryGenerated(summaryResult);
      setCurrentSummary(summaryResult);

    } catch (err) {
      console.error(err);
      setErrorWord('فشل الذكاء الاصطناعي في الاتصال السليم. الرجاء إعادة المحاولة مجدداً.');
    } finally {
      setLoading(false);
      setProcessStatus('');
    }
  };

  // Export as Microsoft Word File (.docx)
  const exportToWord = async () => {
    if (!currentSummary) return;
    setWordExporting(true);
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lectureName: currentSummary.lectureName,
          subject: currentSummary.subject,
          college: college,
          summaryMarkdown: currentSummary.summaryMarkdown,
          keyConcepts: currentSummary.keyConcepts,
          questions: [] // will be downloaded inside quiz section too
        })
      });

      if (!response.ok) throw new Error('فشل تصدير ملف الوورد');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSummary.lectureName}_الملخص_الأكاديمي.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      alert('حدث خطأ أثناء تحميل ملف وورد، يرجى إعادة المحاولة.');
    } finally {
      setWordExporting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="summarizer_panel_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* Configuration Column */}
      <div id="summarizer_form_col" className="lg:col-span-12 xl:col-span-5 space-y-6">
        
        {/* Form panel */}
        <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 shadow-md align-right text-right">
          <div className="flex items-center gap-2.5 justify-end mb-5 font-sans">
            <h3 className="font-bold text-white text-md">تحميل محتوى المحاضرة</h3>
            <div className="w-8 h-8 bg-blue-600/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>

          <form onSubmit={handleAISummarize} className="space-y-4 font-sans">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">اسم المحاضرة / الموضوع (اختياري)</label>
              <input
                type="text"
                value={lectureName}
                onChange={(e) => setLectureName(e.target.value)}
                placeholder="مثال: مقدمة في الذكاء الاصطناعي (أو اتركه ليعتمد على اسم المادة)"
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-amber-500 flex items-center justify-end gap-1">
                <span>اسم المادة الدراسية (مطلوب وإجباري) *</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: هندسة النظم البرمجية، شبكات الحاسب، إلخ..."
                className="w-full bg-[#0D0D10] border border-cyan-800/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-bold"
              />
            </div>

            <div className="space-y-1.5Packed select-lng">
              <label className="block text-xs font-semibold text-slate-400">لغة كراسة التلخيص والأسئلة</label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem('preferred_academic_lang', e.target.value);
                }}
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 text-right cursor-pointer outline-none"
              >
                <option value="العربية">العربية (Arabic)</option>
                <option value="English">English</option>
                <option value="Français">Français (French)</option>
                <option value="Deutsch">Deutsch (German)</option>
                <option value="Español">Español (Spanish)</option>
              </select>
            </div>

            {/* Upload Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-400">اختر طريقة تزويد المحتوى</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFileType('text')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    fileType === 'text'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                      : 'bg-[#0D0D10] text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>كتابة نص يدوي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFileType('pdf')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    ['pdf', 'image', 'audio', 'video'].includes(fileType)
                      ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                      : 'bg-[#0D0D10] text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>رفع ملف أو ذبذبة</span>
                </button>
              </div>
            </div>

            {/* Conditionally render manual text box or smart Drag-n-Drop / Mic */}
            {fileType === 'text' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">محتوى المحاضرة / الملاحظات المكتوبة</label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="أدخل نص المحاضرة، المقالات، أو الملاحظات التي جمعتها لشرحها..."
                  className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right leading-relaxed font-mono"
                />
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* Visual File Drag Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition flex flex-col items-center justify-center gap-2 ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-600/10' 
                      : 'border-slate-800 bg-[#0D0D10] hover:border-slate-700'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,image/*,audio/*,video/*,.csv,.docx,.xlsx,.doc,.xls,.txt"
                    className="hidden"
                  />
                  
                  {uploadedFiles.length > 0 ? (
                    <div className="space-y-2 w-full">
                      <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-full inline-block">
                        <UploadCloud className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-xs font-semibold text-white">الملفات المرفقة للمحاضرة ({uploadedFiles.length})</p>
                      
                      <div className="space-y-1.5 max-h-40 overflow-y-auto text-right font-sans w-full max-w-sm mx-auto p-1 bg-black/20 rounded-lg">
                        {uploadedFiles.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#14141A] p-2 rounded-lg border border-slate-900 text-xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUploadedFile(idx);
                              }}
                              className="text-red-400 hover:text-red-300 transition shrink-0 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-[10px] text-slate-500 shrink-0">{f.fileSize}</span>
                              <span className="text-slate-300 truncate" dir="ltr">{f.fileName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer space-y-1">
                      <UploadCloud className="h-10 w-10 text-slate-500 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">انقر هنا لرفع أو إسقاط ملفات المحاضرة</p>
                      <p className="text-xxs text-slate-500">يدعم PDF، صور تدوين، تسجيلات صوتية، مستندات Word/Excel، أو جداول CSV</p>
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1 mt-2 mx-auto cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>حذف كل الملفات</span>
                    </button>
                  )}
                </div>

                {/* Simulated/Real Classroom Voice Recorder */}
                <div className="bg-[#0D0D10] p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xxs text-slate-500 font-mono">Real-time Classroom Capture</span>
                    <span className="text-xs font-semibold text-slate-400 font-sans">مسجل الصوت الفوري بالمحاضرة</span>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    {isRecording ? (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition flex items-center gap-2 cursor-pointer shadow-md animate-pulse"
                      >
                        <Square className="h-4 w-4" />
                        <span>إيقاف التسجيل ({formatSeconds(recordDuration)})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold py-2 px-4 rounded-lg text-xs border border-blue-500/30 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Mic className="h-4 w-4" />
                        <span>ابدأ التسجيل الحي لبروفسور المحاضرة</span>
                      </button>
                    )}
                  </div>

                  {recordedBlobUrl && (
                    <div className="pt-2">
                      <audio src={recordedBlobUrl} controls className="w-full h-8 bg-slate-900 rounded-lg" />
                    </div>
                  )}
                </div>

              </div>
            )}

            <button
              id="summarize_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 font-sans"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/85 border-t-transparent" />
                  <span className="text-xs">جاري المعالجة بالتكامل التعليمي...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>توليد وتلخيص المحاضرة بالذكاء الاصطناعي</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* System Loading Panel */}
        {loading && (
          <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 space-y-3 animate-pulse text-right">
            <div className="text-xs font-bold text-blue-400 font-mono">AI Lecture Analytics Tracker</div>
            <p className="text-sm text-slate-200">{processStatus}</p>
            <div className="w-full bg-[#0D0D10] rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full animate-infinite transition-all" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {errorWord && (
          <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl text-center text-red-400 text-xs font-semibold">
            {errorWord}
          </div>
        )}

      </div>

      {/* Evaluation Results Column */}
      <div id="summarizer_output_col" className="lg:col-span-12 xl:col-span-7">
        
        {currentSummary ? (
          <div className="space-y-6 text-right font-sans">
            
            {/* Header summary buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#14141A] p-5 rounded-2xl border border-slate-800 shadow">
              <div className="space-y-1 text-right w-full sm:w-auto order-2 sm:order-1">
                <div className="text-[10px] text-blue-500 font-bold font-mono tracking-wider">LECTURE ANALYSIS COMPLETED</div>
                <h2 className="text-xl font-bold text-white leading-normal">{currentSummary.lectureName}</h2>
                <div className="text-xs text-slate-400">المادة: {currentSummary.subject}</div>
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={exportToWord}
                  disabled={wordExporting}
                  className="bg-[#0D0D10] border border-slate-800 hover:border-slate-700 text-blue-400 hover:text-blue-300 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {wordExporting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>تصدير Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSummary(null)}
                  className="bg-[#0D0D10] p-2.5 rounded-xl border border-slate-800 hover:border-red-500 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="تفريغ التلخيص للبدء مجدداً"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Markdown Summary Content */}
            <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 shadow-inner prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2 justify-end border-b border-slate-800 pb-2">
                <span>الملخص الأكاديمي التفصيلي</span>
                <Sparkles className="h-4.5 w-4.5 text-blue-500" />
              </h3>
              
              <div className="markdown-body font-sans text-sm space-y-3 leading-loose align-right">
                <ReactMarkdown>{currentSummary.summaryMarkdown}</ReactMarkdown>
              </div>
            </div>

            {/* Key Terminology Grid */}
            {currentSummary.keyConcepts && currentSummary.keyConcepts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-white text-base">المصطلحات والمفاهيم الجوهرية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSummary.keyConcepts.map((concept, index) => (
                    <div key={index} className="bg-[#14141A] p-4 rounded-xl border border-slate-800 text-right space-y-1">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold text-sm text-blue-400">{concept.title}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{concept.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Programming / Mathematical Code snippets */}
            {currentSummary.codeSnippets && currentSummary.codeSnippets.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-white text-base">المعادلات والصياغات البرمجية المستخلصة</h4>
                <div className="space-y-4">
                  {currentSummary.codeSnippets.map((snippet, idx) => (
                    <div key={idx} className="bg-[#14141A] p-4 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
                        <span className="text-blue-400 font-mono font-bold bg-blue-950/40 px-2 py-0.5 rounded text-[10px]">
                          {snippet.language.toUpperCase()}
                        </span>
                        <span className="text-slate-400 font-semibold">{snippet.purpose}</span>
                      </div>
                      <pre className="text-emerald-400 font-mono text-xs overflow-x-auto p-2 bg-black/40 rounded text-left" dir="ltr">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Use-cases & Scenario analysis */}
            {currentSummary.useCases && currentSummary.useCases.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-white text-base">الحالات العملية ودراسات السيناريو (Use Cases)</h4>
                <div className="space-y-3">
                  {currentSummary.useCases.map((uc, index) => (
                    <div key={index} className="bg-[#14141A] p-4 rounded-xl border border-emerald-550/10 text-right space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold text-sm text-emerald-400 font-sans">الحالة رقم {index + 1}: {uc.scenario.substring(0, 40)}...</span>
                        <HelpCircle className="h-4.5 w-4.5 text-emerald-400" />
                      </div>
                      <p className="text-slate-300 text-xs font-semibold bg-[#0D0D10] p-3 rounded-lg border border-slate-800"><span className="text-slate-400 text-xxs block mb-1">السيناريو المحاكي:</span> {uc.scenario}</p>
                      <p className="text-slate-300 text-xs leading-relaxed"><span className="text-emerald-500 text-xxs block mb-1">التحليل الأكاديمي والحل النموذجي:</span> {uc.analysis}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Empty placeholder card with beautiful aesthetics */
          <div className="bg-[#14141A]/50 h-full min-h-[420px] rounded-3xl border border-slate-850 border-dashed flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="p-4 bg-[#0D0D10] border border-slate-800 text-slate-400 rounded-full shadow-lg">
              <UploadCloud className="h-10 w-10 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-base font-sans">في انتظار رفع المحاضرة</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                املأ التفاصيل على اليمين وارفع ملفات الـ PDF أو الصور أو المحادثة المباشرة وسيقوم بروفسور الذكاء الاصطناعي الخاص بالمنصة بتوليد ملخص سحري متكامل خلال ثوانٍ.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
