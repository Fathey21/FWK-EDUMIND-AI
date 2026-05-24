/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QuizQuestion, LectureSummary, QuestionType } from '../types';
import { 
  Sparkles, CheckCircle, ChevronRight, 
  HelpCircle, Eye, EyeOff, BookOpen, Download 
} from 'lucide-react';

interface QuestionsPanelProps {
  currentSummary: LectureSummary | null;
  college: string;
}

export default function QuestionsPanel({ currentSummary, college }: QuestionsPanelProps) {
  const [questionType, setQuestionType] = useState<QuestionType>('all');
  const [count, setCount] = useState('5');
  const [level, setLevel] = useState('standard'); // 'standard' or 'deep_challenge'
  const [language, setLanguage] = useState(() => localStorage.getItem('preferred_academic_lang') || 'العربية');
  
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Game/Exam interaction states
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [savingDoc, setSavingDoc] = useState(false);

  // Generate Questions from Server
  const handleGenerateQuestions = async () => {
    setLoading(true);
    setSubmitted(false);
    setUserAnswers({});
    
    try {
      const summaryText = currentSummary 
        ? `${currentSummary.summaryMarkdown}\n\nKey terms: ${JSON.stringify(currentSummary.keyConcepts)}`
        : '';
        
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryText,
          lectureName: currentSummary?.lectureName || 'امتحان عام وشامل خارج النطاق',
          subject: currentSummary?.subject || 'تقييم عام للمواد الجامعية',
          questionType,
          count,
          level,
          language
        })
      });

      if (!response.ok) throw new Error('فشلت عملية توليد الأسئلة');
      const result = await response.json();
      setQuestions(result.questions || []);
    } catch (err) {
      alert('حدث عطل في الاتصال بخادم توليد الامتحانات. تم استخدام أسئلة تدريبية بديلة للنجاح.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, option: string) => {
    if (submitted) return;
    setUserAnswers({
      ...userAnswers,
      [qId]: option
    });
  };

  const handleInputChange = (qId: string, val: string) => {
    if (submitted) return;
    setUserAnswers({
      ...userAnswers,
      [qId]: val
    });
  };

  const calculateGrade = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const uAns = userAnswers[q.id]?.trim().toLowerCase();
      const cAns = q.correctAnswer?.trim().toLowerCase();
      if (q.type === 'mcq' || q.type === 'true_false') {
        if (uAns === cAns) correctCount++;
      } else if (q.type === 'fill_blank') {
        if (cAns && uAns && (cAns.includes(uAns) || uAns.includes(cAns))) {
          correctCount++;
        }
      } else {
        // Essay Questions get automatic credit for attempt, graded conceptually
        if (uAns && uAns.length > 5) correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    // Save attempt to local storage to sync with the interactive Analytics Dashboard
    try {
      if (questions.length > 0) {
        const percentage = Math.round((correctCount / questions.length) * 100);
        const attempt = {
          id: Math.random().toString(36).substring(2, 9),
          subject: currentSummary?.subject || (currentSummary?.lectureName?.includes('ذكاء') ? 'الذكاء الاصطناعي' : 'هندسة البرمجيات'),
          lectureName: currentSummary?.lectureName || 'امتحان ذكي شامل للمراجعة والتقييم',
          score: correctCount,
          total: questions.length,
          percentage,
          level,
          timestamp: new Date().toISOString()
        };
        const existing = localStorage.getItem('EDUMIND_QUIZ_ATTEMPTS');
        const attemptsList = existing ? JSON.parse(existing) : [];
        attemptsList.unshift(attempt); // newest first
        localStorage.setItem('EDUMIND_QUIZ_ATTEMPTS', JSON.stringify(attemptsList));
      }
    } catch (e) {
      console.error('Error saving quiz attempt:', e);
    }
  };

  // Export to Word with Exam sheets and Solutions Keys included
  const exportExamToWord = async () => {
    if (questions.length === 0) return;
    setSavingDoc(true);
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lectureName: currentSummary?.lectureName || 'امتحان شامل ومخصص',
          subject: currentSummary?.subject || 'المادة العامة',
          college: college,
          summaryMarkdown: currentSummary?.summaryMarkdown || 'تم توليد هذا الامتحان والملفات الأكاديمية تحت معايير الذكاء الاصطناعي للمراجعة.',
          keyConcepts: currentSummary?.keyConcepts || [],
          questions: questions
        })
      });

      if (!response.ok) throw new Error('فشل التصدير');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `امتحان_مستوى_${currentSummary?.lectureName || 'مادة_عامة'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('حدث خطأ أثناء تصدير ملف الوورد للمستند.');
    } finally {
      setSavingDoc(false);
    }
  };

  return (
    <div id="questions_panel_container" className="space-y-6 font-sans">
      
      {/* Quiz Config */}
      <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 text-right space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="order-2 sm:order-1 text-right w-full sm:w-auto">
            <h3 className="font-bold text-white text-md">مولد الاختبارات الجامعية الشاملة</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {currentSummary 
                ? `سيتم توليد أسئلة مخصصة وبناء اختبار تفاعلي مباشر بناء على محتوى محاضرة "${currentSummary.lectureName}"` 
                : 'مولد الأسئلة الذكية خارج نطاق المحاضرة لتقييم مستواك العام في الكليات'}
            </p>
          </div>
          <div className="order-1 sm:order-2 w-8 h-8 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">نوع الأسئلة المطلوبة</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="w-full bg-[#0D0D10] border border-slate-800 text-slate-200 rounded-xl px-3.5 py-3 text-xs text-right cursor-pointer focus:outline-none focus:border-blue-500 font-sans"
            >
              <option value="all">امتحان متنوع (شامل الجميع)</option>
              <option value="mcq">اختيار من متعدد (MCQ)</option>
              <option value="true_false">صح أو خطأ (True / False)</option>
              <option value="fill_blank">أكمل الفراغات (Fill Blank)</option>
              <option value="essay">أسئلة مقالية للتحليل المفتوح</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">عدد الأسئلة</label>
            <select
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full bg-[#0D0D10] border border-slate-800 text-slate-200 rounded-xl px-3.5 py-3 text-xs text-right cursor-pointer focus:outline-none focus:border-blue-500 font-sans"
            >
              <option value="3">3 أسئلة سريعة</option>
              <option value="5">5 أسئلة قياسية</option>
              <option value="8">8 أسئلة مراجعة متوسطة</option>
              <option value="12">12 سؤالاً شاملاً لدراسة المادة</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">مستوى دقة التحدي التربوي</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLevel('standard')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  level === 'standard'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                    : 'bg-[#0D0D10] text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                مستوى حقيقي قياسي
              </button>
              <button
                type="button"
                onClick={() => setLevel('deep_challenge')}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  level === 'deep_challenge'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'bg-[#0D0D10] text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                تحدي الفهم العميق
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">لغة الاختبار والحلول</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                localStorage.setItem('preferred_academic_lang', e.target.value);
              }}
              className="w-full bg-[#0D0D10] border border-slate-800 text-slate-200 rounded-xl px-3.5 py-3 text-xs text-right cursor-pointer focus:outline-none focus:border-blue-500 font-sans outline-none"
            >
              <option value="العربية">العربية (Arabic)</option>
              <option value="English">English</option>
              <option value="Français">Français (French)</option>
              <option value="Deutsch">Deutsch (German)</option>
              <option value="Español">Español (Spanish)</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="bg-blue-600 cursor-pointer hover:bg-blue-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition flex items-center gap-1.5 shadow"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>جاري صياغة الأسئلة التربوية بالكامل...</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                <span>أنشئ الامتحان المخصص الآن</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Questions Simulator list */}
      {questions.length > 0 ? (
        <div className="space-y-6">
          
          {/* Active summary grade */}
          {submitted && (
            <div className="bg-[#14141A] p-6 rounded-3xl border border-blue-500/20 text-center space-y-3 shadow-md align-right">
              <h4 className="text-base font-bold text-white">نتيجتك الأكاديمية والتقييم النهائي</h4>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400">التحصيل الدراسي:</span>
                <span className="text-3xl font-extrabold text-blue-400">
                  {((score / questions.length) * 100).toFixed(0)}%
                </span>
                <span className="text-slate-400 text-xs">({score} إجابات صحيحة من {questions.length})</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto font-sans">
                {score / questions.length >= 0.8 
                  ? 'مذهل! أسلوبك الدراسي ممتاز وأظهرت فهماً وافياً ومستعد تماماً لأسئلة امتحان المادة بلجنتك.' 
                  : 'أداء جيد. ينصح بالرجوع للملخص أعلاه ومراجعة الشروحات التفصيلية للإجابات الخاطئة للتطور الدراسي.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between font-sans">
            <button
              type="button"
              onClick={exportExamToWord}
              disabled={savingDoc}
              className="bg-[#14141A] hover:bg-[#1f1f2a] border border-slate-800 text-slate-350 hover:text-white py-2 px-4 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              {savingDoc ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent" />
              ) : (
                <Download className="h-4 w-4 text-emerald-400" />
              )}
              <span>تصدير الورقة التدريبية مع مفاتيح الحل لملف Word</span>
            </button>
            <div className="text-xs text-slate-500 font-semibold font-mono">
              EXAM SHEET: {questions.length} QUESTIONS AVAILABLE
            </div>
          </div>

          {/* Interactive Exam List */}
          <div className="space-y-6 text-right font-sans">
            {questions.map((q, index) => {
              const uAns = userAnswers[q.id];
              const isCorrectInMCQ = uAns?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

              return (
                <div 
                  key={q.id} 
                  className={`p-6 rounded-3xl bg-[#14141A] border text-right space-y-4 transition ${
                    submitted 
                      ? (q.type === 'essay' ? 'border-slate-800' : (isCorrectInMCQ ? 'border-emerald-500/30 bg-emerald-950/5' : 'border-red-500/30 bg-red-950/5'))
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-[#0D0D10] border border-slate-800 px-2 py-1 rounded">
                      {q.type === 'mcq' && 'سؤال خيارات'}
                      {q.type === 'true_false' && 'صح أم خطأ'}
                      {q.type === 'fill_blank' && 'أدخل الكلمة الناقصة'}
                      {q.type === 'essay' && 'مقالي وتحليل علمي'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm leading-relaxed">{q.questionText}</span>
                      <span className="text-xs bg-[#0D0D10] text-blue-400 font-extrabold h-6 w-6 rounded-full flex items-center justify-center shrink-0 border border-slate-800">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* MCQ choices */}
                  {q.type === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = uAns === opt;
                        const isCorrectOpt = opt === q.correctAnswer;
                        const letter = String.fromCharCode(1571 + optIdx); // أ، ب، ج، د

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={submitted}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`p-3.5 rounded-xl text-right text-xs transition border cursor-pointer ${
                              isChosen
                                ? (submitted
                                    ? (isCorrectOpt ? 'bg-emerald-600 text-white border-emerald-500 font-bold' : 'bg-red-600 text-white border-red-500')
                                    : 'bg-blue-600 text-white border-blue-500 font-bold')
                                : (submitted && isCorrectOpt
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50 font-bold'
                                    : 'bg-[#0D0D10] text-slate-350 border-slate-800 hover:bg-[#1a1a24]')
                            }`}
                          >
                            <span className="font-bold opacity-80 pl-1">{letter}) </span> {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* True or False options */}
                  {q.type === 'true_false' && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      {['صح', 'خطأ'].map((opt) => {
                        const isChosen = uAns === opt;
                        const isCorrectOpt = opt === q.correctAnswer;

                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={submitted}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`py-3 px-6 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                              isChosen
                                ? (submitted
                                    ? (isCorrectOpt ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-red-600 text-white border-red-500')
                                    : 'bg-blue-600 text-white border-blue-500')
                                : (submitted && isCorrectOpt
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/50'
                                    : 'bg-[#0D0D10] text-slate-350 border-slate-800 hover:bg-[#1a1a24]')
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in blanks text file */}
                  {q.type === 'fill_blank' && (
                    <div className="pt-2">
                      <input
                        type="text"
                        disabled={submitted}
                        value={uAns || ''}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="أدخل إجابتك النصية هنا لسد الفراغ..."
                        className={`w-full max-w-md bg-[#0D0D10] border rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right ${
                          submitted 
                            ? (uAns?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase() ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-100')
                            : 'border-slate-800'
                        }`}
                      />
                    </div>
                  )}

                  {/* Essay Questions */}
                  {q.type === 'essay' && (
                    <div className="pt-2 space-y-2">
                      <textarea
                        rows={4}
                        disabled={submitted}
                        value={uAns || ''}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="أكتب فقرة مقالية لمناقشة وتحليل هذا السؤال الجامعي..."
                        className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-sans"
                      />
                    </div>
                  )}

                  {/* Explanations block */}
                  {submitted && (
                    <div className="bg-[#09090D] p-4 rounded-xl border border-slate-850 text-right space-y-2.5">
                      <div className="flex items-center gap-1.5 justify-end text-[10px] font-bold text-slate-500">
                        <span>التحليل والتفسير الأكاديمي</span>
                        <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="text-xs leading-relaxed text-slate-300">
                        <span className="font-bold text-emerald-500 font-sans">الإجابة النموذجية المعتمدة:</span> {q.correctAnswer}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-850 pt-2 font-sans">
                        {q.explanation}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Core submission trigger */}
          {!submitted && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={calculateGrade}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3.5 px-8 rounded-xl transition text-xs shadow cursor-pointer font-sans"
              >
                تأكيد وتسليم الامتحان للمراجعة
              </button>
            </div>
          )}

        </div>
      ) : (
        <div id="questions_empty_state" className="bg-[#14141A]/50 h-full min-h-[300px] border border-slate-850 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4 font-sans">
          {/* Empty exam selection cards */}
          <div className="p-4 bg-[#0D0D10] border border-slate-800 text-slate-500 rounded-full">
            <HelpCircle className="h-10 w-10 text-blue-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-bold text-base font-sans">غرفة الاستعداد للامتحان الإلكتروني</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              انقر فوق "أنشئ الامتحان المخصص الآن" وسيقوم النظام بتصميم باقة شاملة من الأسئلة والأحلام العلمية المتوفرة لمشاركتك.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
