/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileText, UploadCloud, BookOpen, Sparkles, CheckCircle2, 
  HelpCircle, Send, Library, RefreshCw, Trash2, 
  Download, FileSpreadsheet, FileImage, ShieldAlert,
  GraduationCap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

interface ExamSolverPanelProps {
  college: string;
}

interface SolvedExam {
  solvedTitle: string;
  overallAnalysis: string;
  solutions: {
    questionNumber: string;
    questionText: string;
    solvedAnswer: string;
    explanationSteps: string;
    scientificReference: string;
  }[];
  recommendations: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ExamSolverPanel({ college }: ExamSolverPanelProps) {
  // Input fields
  const [examTitle, setExamTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('preferred_academic_lang') || 'العربية');
  const [rawText, setRawText] = useState('');
  
  // Custom multi-file support list
  const [uploadedFiles, setUploadedFiles] = useState<{
    fileName: string;
    fileSize: string;
    fileType: 'pdf' | 'image' | 'audio' | 'video' | 'text';
    base64Data?: string;
    rawText?: string;
  }[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Solving states
  const [loading, setLoading] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [solvedExam, setSolvedExam] = useState<SolvedExam | null>(null);
  const [errorText, setErrorText] = useState('');

  // Tutoring Chat States
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // File picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        addFileToList(file);
      });
    }
  };

  const addFileToList = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    let detectedType: 'pdf' | 'image' | 'audio' | 'video' | 'text' = 'text';
    if (ext === 'pdf') {
      detectedType = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      detectedType = 'image';
    } else if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext || '')) {
      detectedType = 'audio';
    } else if (['mp4', 'mkv', 'avi', 'mov'].includes(ext || '')) {
      detectedType = 'video';
    }

    // Convert CSV and txt files into easily parseable strings inside client
    if (ext === 'csv' || ext === 'txt' || ext === 'md' || ext === 'json') {
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
      // General binaries using base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
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

  // Drag and drop events
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
        addFileToList(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Invoke Solving API
  const handleSolveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      alert('الرجاء إدخال عنوان أو تعريف للامتحان أولاً');
      return;
    }

    setLoading(true);
    setSolvedExam(null);
    setChatHistory([]);
    setErrorText('');
    setProcessStatus('جاري مراجعة ورقة الاسئلة واستكشاف الهياكل التعليمية...');

    try {
      setTimeout(() => setProcessStatus('جاري استخراج الأسئلة وتحديد نمط المسائل والتمارين...'), 1500);
      setTimeout(() => setProcessStatus('جاري صياغة الحلول النموذجية مع البراهين والخطوات الرياضية والدراسية...'), 3500);
      setTimeout(() => setProcessStatus('جاري المراجعة العلمية وتثبيت السندات والمراجع المعتمدة...'), 6000);

      const requestBody = {
        examTitle,
        subject,
        college,
        rawText,
        files: uploadedFiles,
        language
      };

      const response = await fetch('/api/gemini/solve-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('فشلت عملية حل الامتحان، يرجى إعادة التأكد من جودة الملفات');
      }

      const result: SolvedExam = await response.json();
      setSolvedExam(result);

      // Welcome message from Tutor
      setChatHistory([
        {
          role: 'assistant',
          content: language === 'English'
            ? `Hello! I have analyzed and solved the **${result.solvedTitle}** exam questions for you. Feel free to ask me literally any question: request a simpler explanation, inquire why specific formulas were applied, or test yourself on any part of the answer!`
            : `مرحباً بك! لقد قمت بحل واستخراج أسئلة امتحان **${result.solvedTitle}** بنجاح وتوفير الإجابة النموذجية الكاملة. يمكنك الآن طرح أي استفسار علي: اسألني عن سبب استخدام هذه المعادلة، اطلب مني شرحاً أبسط، أو تزويدك بتمارين تكميلية للتدريب!`
        }
      ]);

    } catch (err) {
      console.error(err);
      setErrorText('واجه النظام عائقاً في فك شيفرة الامتحان الحالي. الرجاء إعادة المحاولة بصيغة أوضح.');
    } finally {
      setLoading(false);
      setProcessStatus('');
    }
  };

  // Tutor Q&A chat trigger
  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !solvedExam) return;

    const userMsg = chatInput;
    setChatInput('');
    
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    // Scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const response = await fetch('/api/gemini/tutor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg,
          history: updatedHistory.slice(0, -1),
          solvedExamContext: solvedExam,
          language
        })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'عذراً، واجهت مشكلة في الاستيعاب الفوري الشامل. يرجى إعادة إرسال سؤالك لكي أشرحه لك مجدداً!' 
        }
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 font-sans">
      
      {/* Parameters Panel */}
      <div className="xl:col-span-12 lg:col-span-12 xl:col-span-4 space-y-6">
        
        <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 shadow-md text-right">
          <div className="flex items-center gap-2.5 justify-end mb-5">
            <h3 className="font-bold text-white text-md">تزويد الامتحان المكتوب أو المصور</h3>
            <div className="w-8 h-8 bg-emerald-600/10 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
          </div>

          <form onSubmit={handleSolveExam} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">عنوان الامتحان / السنة</label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="مثال: امتحان تصفية هندسة 2025، فلوكست الشامل"
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">موضوع أو مادة الامتحان</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: رياضيات متقطعة، محاسبة تكاليف"
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">لغة الرد والتفسيرات الأكاديمية</label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem('preferred_academic_lang', e.target.value);
                }}
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 text-right cursor-pointer outline-none"
              >
                <option value="العربية">العربية (Arabic)</option>
                <option value="English">English</option>
                <option value="Français">Français (French)</option>
                <option value="Deutsch">Deutsch (German)</option>
                <option value="Español">Español (Spanish)</option>
              </select>
            </div>

            {/* Drag and Drop multi-files area */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400">ملفات الامتحان (PDF، صور، CSV، ملفات تدوين)</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-600/10' 
                    : 'border-slate-800 bg-[#0D0D10] hover:border-slate-700'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,image/*,.csv,.xlsx,.xls,.doc,.docx,.txt"
                  className="hidden"
                />
                <UploadCloud className="h-9 w-9 text-slate-500" />
                <p className="text-xs font-semibold text-slate-300">اسحب أو ارفع ملفات الامتحان معاً</p>
                <p className="text-[10px] text-slate-500">مسموح برفع وتصوير حتى 5 مستندات/صور بآن واحد لتجميع الأسئلة</p>
              </div>
            </div>

            {/* List of uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-[#0D0D10] p-3 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                <span className="text-[10px] text-slate-500 font-bold block">الملفات المرفقة للامتحان ({uploadedFiles.length})</span>
                {uploadedFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#14141A] p-2 rounded-lg border border-slate-900">
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-red-400 hover:text-red-300 transition shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center gap-2 truncate text-right">
                      <div className="text-xxs text-slate-500 shrink-0">{f.fileSize}</div>
                      <div className="text-xs font-medium text-slate-200 truncate" dir="ltr">{f.fileName}</div>
                      <div className="text-emerald-400 shrink-0">
                        {f.fileType === 'pdf' ? <FileText className="h-3.5 w-3.5" /> : <FileImage className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Exam content/pasted text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">أو اكتب الأسئلة يدوياً هنا</label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="أدخل نص المسائل أو فكرة الأسئلة التي تبحث عن تحليلها وحلها بشكل تبسيطي..."
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-right leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>بروفسور الذكاء يحسب الحل الآن...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                  <span>حل الامتحان بالكامل وشرح المفهوم العلمي</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Process Status message */}
        {loading && (
          <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 space-y-3 animate-pulse text-right">
            <div className="text-[10px] font-bold text-emerald-400 font-mono">Academic Solver Engines Working</div>
            <p className="text-xs text-slate-300">{processStatus}</p>
            <div className="w-full bg-[#0D0D10] rounded-full h-1 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full animate-infinite" style={{ width: '80%' }}></div>
            </div>
          </div>
        )}

        {errorText && (
          <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl text-center text-red-400 text-xs font-semibold flex items-center gap-2 justify-center">
            <span>{errorText}</span>
            <ShieldAlert className="h-4 w-4" />
          </div>
        )}

      </div>

      {/* Main Solution Output Area */}
      <div className="xl:col-span-12 lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
        
        {solvedExam ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right font-sans">
            
            {/* Left Column: Solution Book */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Header meta card */}
              <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="text-right">
                  <div className="text-[9px] text-emerald-400 font-bold font-mono tracking-widest">Model Solution Generated</div>
                  <h2 className="text-lg font-bold text-white mt-1">{solvedExam.solvedTitle}</h2>
                  <div className="text-xs text-slate-400 mt-0.5">مادة: {subject || "الدراسات الأكاديمية البحتة"}</div>
                </div>
                <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-full border border-emerald-500/20 shadow-md">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              {/* Overall analysis and reviews */}
              <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 text-slate-200">
                <h4 className="text-xs font-bold text-slate-400 mb-2 font-mono">التحليل التعليمي المرجعي للامتحان</h4>
                <p className="text-xs leading-relaxed text-slate-300">{solvedExam.overallAnalysis}</p>
              </div>

              {/* Questions solutions cards */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 justify-end">
                  <span>الأجوبة والخطوات النموذجية المفصلة</span>
                  <Library className="h-4 w-4 text-emerald-400" />
                </h3>

                {solvedExam.solutions.map((sol, index) => (
                  <div key={index} className="bg-[#14141A] rounded-2xl border border-slate-800 p-5 space-y-4 shadow transition-all hover:border-slate-700">
                    
                    {/* Item header */}
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                      <span className="text-[10px] font-bold text-slate-500 bg-[#0D0D10] border border-slate-850 px-2.5 py-1 rounded-lg">
                        {sol.scientificReference || "مرجع أكاديمي عام"}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {sol.questionNumber}
                      </span>
                    </div>

                    {/* Question Statement */}
                    <div className="bg-[#0D0D10] p-3 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 block mb-1">صيغة السؤال:</span>
                      <p className="text-xs text-slate-200 font-semibold leading-relaxed">{sol.questionText}</p>
                    </div>

                    {/* Final Answer */}
                    <div className="bg-emerald-950/10 p-3.5 rounded-xl border border-emerald-500/25">
                      <span className="text-[10px] text-emerald-400 font-bold block mb-1">الإجابة النهائية القاطعة:</span>
                      <p className="text-xs text-emerald-100 font-semibold leading-relaxed">{sol.solvedAnswer}</p>
                    </div>

                    {/* Explanations & steps detail */}
                    <div className="text-slate-300 text-xs space-y-2">
                      <span className="text-[10px] text-slate-400 block font-semibold">خطوات الاستنباط والحل والشرح بالتأصيل:</span>
                      <div className="prose prose-invert max-w-none text-slate-200 bg-[#0D0D10] rounded-xl p-4 border border-slate-900 leading-relaxed font-sans text-xxs overflow-x-auto" dir="rtl">
                        <ReactMarkdown>{sol.explanationSteps}</ReactMarkdown>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* End Recommendations banner */}
              {solvedExam.recommendations && (
                <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/20 text-right space-y-1">
                  <span className="text-xs font-bold text-emerald-400">توجيهات أكاديمية للتفوق</span>
                  <p className="text-xxs text-slate-300 leading-relaxed">{solvedExam.recommendations}</p>
                </div>
              )}

            </div>

            {/* Right Column: Dynamic AI Tutor Live Chat */}
            <div className="lg:col-span-5 flex flex-col h-[650px] bg-[#14141A] rounded-3xl border border-slate-800 overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 bg-[#0D0D10] border-b border-slate-800 flex items-center justify-between">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white">البروفسور الجامعي وعضو هيئة التدريس الفوري</h4>
                  <p className="text-[9px] text-slate-500">منصة شرح وتفسير مخرجات الامتحان فوري وبأدق الخطوات</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Chats Log stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col max-w-[85%] text-xs p-3 rounded-2xl leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white mr-auto rounded-tr-none text-left' 
                        : 'bg-[#0D0D10] text-slate-200 ml-auto rounded-tl-none border border-slate-850 text-right'
                    }`}
                    style={{ direction: msg.role === 'user' ? 'ltr' : 'rtl' }}
                  >
                    <span className="text-[9px] text-slate-400 mb-1 block font-mono">
                      {msg.role === 'user' ? 'أنا (الطالب)' : 'البروفسور المعين'}
                    </span>
                    <div className="prose prose-invert max-w-none text-xxs font-sans space-y-1.5 leading-loose">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex flex-col max-w-[80%] bg-[#0D0D10] text-slate-200 ml-auto rounded-2xl rounded-tl-none p-3 border border-slate-850 text-right">
                    <span className="text-[9px] text-slate-400 mb-1 block">البروفسور الجامعي</span>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] text-slate-400 mr-2 font-semibold">جاري تحضير الشرح العلمي...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Command Form */}
              <form onSubmit={handleSendTutorMessage} className="p-3 bg-[#0D0D10] border-t border-slate-850 flex gap-2">
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3 flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اسألني عن تفسير خطوة معينة، قانون، مبرهنة..."
                  className="flex-1 bg-[#14141A] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 text-right"
                />
              </form>

            </div>

          </div>
        ) : (
          /* Empty output placeholder */
          <div className="bg-[#14141A]/50 h-full min-h-[450px] rounded-3xl border border-slate-850 border-dashed flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="p-4 bg-[#0D0D10] border border-slate-800 text-slate-500 rounded-full">
              <BookOpen className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-base">في انتظار رفع أو إدخال أوراق الامتحانات</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                ارفع صورة لورقة الامتحان، أو حدد ملفات الأسئلة المتعددة. وسيقوم البروفسور الأكاديمي الشامل بحل كافة التمارين وتقديم شروحاتها خطوة بخطوة مع توفير مدرس خصوصي مرافق لشرح كل النقاط في الحال.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
