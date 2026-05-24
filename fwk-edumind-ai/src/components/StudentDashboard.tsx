/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Award, CheckCircle, AlertCircle, 
  Calendar, RotateCw, BookOpen, Sparkles, Trash2, Plus, BarChart2,
  BookMarked, HelpCircle, Activity, Lightbulb
} from 'lucide-react';
import { motion } from 'motion/react';
// Recharts imports removed to ensure native React 19 compatibility without rendering crashes

interface StudentDashboardProps {
  college: string;
}

interface QuizAttempt {
  id: string;
  subject: string;
  lectureName: string;
  score: number;
  total: number;
  percentage: number;
  level: string; // 'standard' | 'deep_challenge'
  timestamp: string;
}

// Default computer science sample statistics for Fathy Al-Keilani
const DEFAULT_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att-1',
    subject: 'هندسة البرمجيات',
    lectureName: 'دورة حياة البرمجيات ونموذج الشلال (Waterfall vs Agile)',
    score: 8,
    total: 10,
    percentage: 80,
    level: 'standard',
    timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'att-2',
    subject: 'نظم قواعد البيانات',
    lectureName: 'معايير التطبيع وصيغة المقاطعة الثالثة (3NF Normalization)',
    score: 4,
    total: 5,
    percentage: 80,
    level: 'deep_challenge',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'att-3',
    subject: 'شبكات الحاسب',
    lectureName: 'بروتوكولات التوجيه ونموذج OSI Layers',
    score: 3,
    total: 5,
    percentage: 60,
    level: 'standard',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'att-4',
    subject: 'الذكاء الاصطناعي',
    lectureName: 'خوارزميات البحث الأعمى والبحث الموجه (Heuristic Search)',
    score: 9,
    total: 10,
    percentage: 90,
    level: 'deep_challenge',
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'att-5',
    subject: 'شبكات الحاسب',
    lectureName: 'تأصيل بروتوكول TCP/IP ومصافحة السلام الثلاثية',
    score: 2,
    total: 5,
    percentage: 40,
    level: 'deep_challenge',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

// Helper to calculate subject analysis
interface SubjectAnalysis {
  subject: string;
  attemptsCount: number;
  averagePercentage: number;
  levelInfo: 'excellent' | 'very_good' | 'needs_improvement';
  strongTopics: string[];
  weakTopics: string[];
  recommendation: string;
}

export default function StudentDashboard({ college }: StudentDashboardProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [evolutionSubject, setEvolutionSubject] = useState<string>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  
  // Custom mock builder inputs
  const [mockSubject, setMockSubject] = useState('هندسة البرمجيات');
  const [mockScore, setMockScore] = useState(8);
  const [mockTotal, setMockTotal] = useState(10);
  const [mockLevel, setMockLevel] = useState('standard');
  const [showingMockBuilder, setShowingMockBuilder] = useState(false);

  // Ibn Al-Haytham integration states
  const [showingHeithamSync, setShowingHeithamSync] = useState(false);
  const [heithamText, setHeithamText] = useState('');
  const [heithamError, setHeithamError] = useState<string | null>(null);
  const [isParsingHeitham, setIsParsingHeitham] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const handleHeithamSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heithamText.trim()) {
      setHeithamError('الرجاء لصق النص المنسوخ من البوابة قبل المزامنة.');
      return;
    }

    setIsParsingHeitham(true);
    setHeithamError(null);
    setSyncSuccessMsg(null);

    try {
      const response = await fetch('/api/gemini/parse-ibn-haytham', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText: heithamText }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.error || 'عذراً، فشل تحليل البيانات الأكاديمية. يرجى التحقق من النص ولصقه بشكل صحيح.');
      }

      const parsedData = result.data;
      if (parsedData.attempts && parsedData.attempts.length > 0) {
        // Build new simulation array based on the official Ibn Al-Haytham subjects
        const importedAttempts: QuizAttempt[] = parsedData.attempts.map((item: any, idx: number) => ({
          id: item.id || `heitham-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          subject: item.subject,
          lectureName: item.lectureName || 'امتحان شامل مسجل بنظام ابن الهيثم',
          score: typeof item.score === 'number' ? item.score : 80,
          total: typeof item.total === 'number' ? item.total : 100,
          percentage: typeof item.percentage === 'number' ? item.percentage : 80,
          level: item.level || 'standard',
          timestamp: item.timestamp || new Date().toISOString()
        }));

        localStorage.setItem('EDUMIND_QUIZ_ATTEMPTS', JSON.stringify(importedAttempts));
        setAttempts(importedAttempts);
        
        // Update user's name locally in current session if possible
        if (parsedData.studentName) {
          try {
            const usersStored = localStorage.getItem('EDUMIND_USERS');
            if (usersStored) {
              const users = JSON.parse(usersStored);
              if (users.length > 0) {
                users[0].name = parsedData.studentName;
                if (parsedData.college) {
                  users[0].college = parsedData.college;
                }
                localStorage.setItem('EDUMIND_USERS', JSON.stringify(users));
              }
            }
          } catch (storageErr) {
            console.warn('Could not update student storage details dynamically:', storageErr);
          }
        }

        let successMessage = `تمت المزامنة بنجاح! تم استخراج عدد (${importedAttempts.length}) مقررات دراسية حقيقية من النص بنجاح.`;
        if (parsedData.studentName) {
          successMessage += ` وتم تحديث اسم الطالب ليكون: [${parsedData.studentName}].`;
        }
        if (parsedData.gpa) {
          successMessage += ` المعدل التراكمي المكتشف: [${parsedData.gpa}].`;
        }

        setSyncSuccessMsg(successMessage);
        setHeithamText('');
      } else {
        throw new Error('لم يتم العثور على أي معلومات كافية للمواد والتقديرات في النص المنسوخ. يرجى التأكد من نسخ جدول بيان الدرجات كاملاً.');
      }
    } catch (err: any) {
      console.error(err);
      setHeithamError(err.message || 'حدث خطأ غير متوقع أثناء الاتصال بخوادم المزامنة الذكية لـ ابن الهيثم.');
    } finally {
      setIsParsingHeitham(false);
    }
  };

  // Load stats from local Storage
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      const stored = localStorage.getItem('EDUMIND_QUIZ_ATTEMPTS');
      if (stored) {
        setAttempts(JSON.parse(stored));
      } else {
        localStorage.setItem('EDUMIND_QUIZ_ATTEMPTS', JSON.stringify(DEFAULT_ATTEMPTS));
        setAttempts(DEFAULT_ATTEMPTS);
      }
    } catch (e) {
      console.error(e);
      setAttempts(DEFAULT_ATTEMPTS);
    }
  };

  // Reset function
  const handleResetStats = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تهيئة الإحصائيات والعودة للبيانات الأكاديمية الافتراضية؟')) {
      localStorage.setItem('EDUMIND_QUIZ_ATTEMPTS', JSON.stringify(DEFAULT_ATTEMPTS));
      setAttempts(DEFAULT_ATTEMPTS);
      setSelectedSubject(null);
    }
  };

  // Add mock attempt
  const handleAddMockAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    const newAttempt: QuizAttempt = {
      id: Math.random().toString(36).substring(2, 9),
      subject: mockSubject,
      lectureName: `اختبار تجريبي مضاف في موضوع ${mockSubject}`,
      score: mockScore,
      total: mockTotal,
      percentage: Math.round((mockScore / mockTotal) * 100),
      level: mockLevel,
      timestamp: new Date().toISOString()
    };

    const updated = [newAttempt, ...attempts];
    localStorage.setItem('EDUMIND_QUIZ_ATTEMPTS', JSON.stringify(updated));
    setAttempts(updated);
    setShowingMockBuilder(false);
  };

  // Delete individual attempt
  const handleDeleteAttempt = (id: string) => {
    const updated = attempts.filter(a => a.id !== id);
    localStorage.setItem('EDUMIND_QUIZ_ATTEMPTS', JSON.stringify(updated));
    setAttempts(updated);
    if (selectedSubject) {
      // Refresh selected subject analysis state if needed
      const remainingForSubject = updated.filter(a => a.subject === selectedSubject);
      if (remainingForSubject.length === 0) {
        setSelectedSubject(null);
      }
    }
  };

  // Aggregate stats
  const totalAttempts = attempts.length;
  const avgPercentage = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
    : 0;
  
  const subjectsMap = new Map<string, QuizAttempt[]>();
  attempts.forEach(a => {
    const arr = subjectsMap.get(a.subject) || [];
    arr.push(a);
    subjectsMap.set(a.subject, arr);
  });

  const processedSubjects: SubjectAnalysis[] = Array.from(subjectsMap.entries()).map(([subj, subjAttempts]) => {
    const avg = Math.round(subjAttempts.reduce((sum, a) => sum + a.percentage, 0) / subjAttempts.length);
    let levelInfo: 'excellent' | 'very_good' | 'needs_improvement' = 'needs_improvement';
    if (avg >= 85) levelInfo = 'excellent';
    else if (avg >= 65) levelInfo = 'very_good';

    let strongTopics: string[] = [];
    let weakTopics: string[] = [];
    let recommendation = '';

    // Create tailored strengths and weaknesses based on course material
    if (subj === 'الذكاء الاصطناعي') {
      strongTopics = avg >= 70 ? ['خوارزميات البحث الذاتي (Heuristics)', 'المنطق الرياضي في حل المشكلات'] : ['المصطلحات العامة'];
      weakTopics = avg < 85 ? ['طرق البحث بالعمق الأقصى (DFS) وتفادي الحلقات اللانهائية', 'فهم الفضاء الإحصائي للمعادلات'] : ['فهم تقنيات التعلّم الفائقة'];
      recommendation = avg < 75 
        ? 'يرجى مراجعة محاضرة خوارزميات البحث وتطبيقاتها عملياً، والتركيز على حل تمارين اختبارات الأعمى.' 
        : 'أداء متميز في الذكاء الاصطناعي! يمكنك الانتقال لحل اختبارات "الفهم العميق" لتعزيز تأصيلك البرمجي.';
    } else if (subj === 'نظم قواعد البيانات') {
      strongTopics = avg >= 75 ? ['التطبيع وحذف التكرار (3NF)', 'صياغة المفاتيح الأساسية والخارجية'] : ['بناء الجداول الأساسية'];
      weakTopics = avg < 85 ? ['الجبر العلائقي ومخططات الكيانات (ERD)', 'تحسين سرعة الاستعلامات الفرعية 복잡'] : ['مفاهيم اتساق العمليات Transaction ACID'];
      recommendation = avg < 75 
        ? 'ننصحك بمراجعة قوانين الجبر العلائقي والتكرار الرياضي، وحل المزيد من تمارين الفهرسة والاستعلام المقارن.' 
        : 'رائع جداً! مهاراتك في التطبيع وتصميم الجداول ممتازة ومثالية لمشاريع التخرج.';
    } else if (subj === 'هندسة البرمجيات') {
      strongTopics = avg >= 70 ? ['فهم الفروقات في نماذج التطوير Agile vs Waterfall', 'متطلبات النظم الوظيفية'] : ['توثيق النظم'];
      weakTopics = avg < 85 ? ['تطوير وتحليل حالات الاستخدام (Use Cases)', 'نمذجة سلوك برمجيات الكلية'] : ['مستويات جودة الفحص والشيفرة'];
      recommendation = avg < 75 
        ? 'راجع جيداً معايير هندسة البرمجيات ومخططات حالات الاستخدام، تدرب بدمج مفاهيم Agile مع تصميم الأنظمة.' 
        : 'قواعد هندسة البرمجيات والمقاييس الأجايل واضحة ومستوعبة لديك بالكامل.';
    } else if (subj === 'شبكات الحاسب') {
      strongTopics = avg >= 70 ? ['نموذج OSI للطبقات السبعة', 'مفاهيم نقل البيانات الأساسية'] : ['التعرف على كابلات التوصيل'];
      weakTopics = avg < 85 ? ['بروتوكول TCP/IP ومصافحة السلام الثلاثية (Three-way Handshake)', 'عنونة الشبكات الفرعية (IP Subnetting)'] : ['بروتوكولات التوجيه الديناميكية OSPF'];
      recommendation = avg < 70 
        ? 'عنونة الشبكات الفرعية (IP Subnetting) تحتاج منك لمراجعة رياضية ومحاكاة عملية عاجلة قبل الاختبار.' 
        : 'أداء رائع ومبشر بالخير! احرص على مراجعة بروتوكولات التوجيه للتفوق الكامل.';
    } else {
      strongTopics = avg >= 75 ? ['الحفظ والاستيعاب العام للمصطلحات', 'حل الأجوبة الاختيارية السريعة'] : ['تخمين الحلول المباشرة'];
      weakTopics = avg < 85 ? ['تحليل البراهين والخطوات المفصلة تفادياً لنقص الدرجات', 'إجابة الأسئلة المقالية الدقيقة'] : ['فهم الحالات الدراسية النادرة'];
      recommendation = 'استمر في استخدام مُلخّص المحاضرات ومولد الأسئلة لجمع الأنماط المتكررة في امتحانات السنوات السابقة.';
    }

    return {
      subject: subj,
      attemptsCount: subjAttempts.length,
      averagePercentage: avg,
      levelInfo,
      strongTopics,
      weakTopics,
      recommendation
    };
  });

  // Calculate top weakness subject
  const weakestSubjectObj = processedSubjects.length > 0 
    ? [...processedSubjects].sort((a, b) => a.averagePercentage - b.averagePercentage)[0]
    : null;

  // Active analysis for selected subject or the weakest one by default
  const activeAnalysis = selectedSubject 
    ? processedSubjects.find(s => s.subject === selectedSubject) 
    : (weakestSubjectObj || null);

  // Subject options in CS college
  const predefinedSubjects = [
    'الذكاء الاصطناعي',
    'نظم قواعد البيانات',
    'هندسة البرمجيات',
    'شبكات الحاسب',
    'تصميم الخوارزميات',
    'أمن المعلومات وبنيتها'
  ];

  // Prepare data for Recharts Line Chart
  const getLineChartData = () => {
    // Sort attempts chronologically (oldest to newest)
    const sorted = [...attempts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Filter by subject if not 'all'
    const filtered = evolutionSubject === 'all' 
      ? sorted 
      : sorted.filter(a => a.subject === evolutionSubject);

    return filtered.map((attempt, index) => {
      const dateObj = new Date(attempt.timestamp);
      const formattedDate = dateObj.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
      return {
        pointKey: index + 1,
        name: `اختبار ${index + 1}`,
        التاريخ: formattedDate,
        النسبة: attempt.percentage,
        الدرجة: `${attempt.score}/${attempt.total}`,
        المادة: attempt.subject,
        المحاضرة: attempt.lectureName.length > 25 ? attempt.lectureName.slice(0, 25) + '...' : attempt.lectureName
      };
    });
  };

  const lineChartData = getLineChartData();

  // Custom SVG coordinates calculations for responsive, bug-free line chart
  const svgW = 500;
  const svgH = 200;
  const padX = 45;
  const padY = 25;
  const drawW = svgW - padX * 2;
  const drawH = svgH - padY * 2;

  const points = lineChartData.map((d, i) => {
    const x = lineChartData.length === 1
      ? padX + drawW / 2
      : padX + (i / (lineChartData.length - 1)) * drawW;
    const y = (svgH - padY) - (d.النسبة / 100) * drawH;
    return { x, y, data: d, index: i };
  });

  const gridPercentages = [0, 20, 40, 60, 80, 100];

  return (
    <div className="space-y-6 font-sans text-right">

      {/* Intro Header */}
      <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="order-2 md:order-1 text-right w-full md:w-auto">
          <div className="flex items-center gap-2 justify-end mb-1">
            <span className="text-xxs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold">
              التقرير الأكاديمي الرقمي الموحد حاسبات المنوفية
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h2 className="text-lg font-bold text-white">لوحة ذكاء الأداء والتحليل الأكاديمي</h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            مستند معايير إحصائي يوضح تحصيل الطالب المتميز <span className="text-blue-400 font-bold">فتحي الكيلاني</span> ونقاط القوة والضعف في جميع المقررات.
          </p>
        </div>
        
        <div className="order-1 md:order-2 flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setShowingHeithamSync(!showingHeithamSync)}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-violet-950/40 cursor-pointer border border-violet-500/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-200 animate-pulse" />
            <span>ربط وتزامن ابن الهيثم 🎓</span>
          </button>

          <button
            onClick={() => setShowingMockBuilder(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة اختبار محاكى</span>
          </button>
          
          <button
            onClick={handleResetStats}
            className="p-2 bg-[#0D0D10] border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="إعادة تهيئة الإحصائيات الافتراضية"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showingHeithamSync && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14141E] border border-violet-500/30 p-6 rounded-3xl text-right space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-violet-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span>بوابة ربط ومزامنة البيانات الأكاديمية مع نظام ابن الهيثم 🎓</span>
            </span>
            <button
              onClick={() => {
                setShowingHeithamSync(false);
                setHeithamError(null);
                setSyncSuccessMsg(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 font-bold cursor-pointer"
            >
              إغلاق البوابة
            </button>
          </div>

          <div className="bg-[#0A0A0F] border border-slate-850 p-4.5 rounded-2xl space-y-3 text-xs leading-relaxed text-slate-300">
            <p className="font-extrabold text-white text-right">💡 كيف تتم عملية الربط للحصول على بيانات درجاتك وموادك الفعلية؟</p>
            <ol className="list-decimal list-inside space-y-1.5 text-right pr-2 text-[11px] text-slate-400">
              <li>قم بفتح موقع <a href="https://myu.mans.edu.eg/" target="_blank" rel="noreferrer" className="text-violet-400 font-bold underline">نظام ابن الهيثم للخدمات الطلابية</a> الخاص بجامعتك في علامة تبويب جديدة وسجل دخولك.</li>
              <li>انتقل إلى صفحة <strong className="text-slate-200">"بيان حالة الطالب"</strong> أو <strong className="text-slate-200">"تقديرات المقررات الدراسية"</strong>.</li>
              <li>قم بتحديد الصفحة كاملة <kbd className="bg-slate-800 px-1 rounded text-xxs border border-slate-700">Ctrl + A</kbd> ثم نسخها <kbd className="bg-slate-800 px-1 rounded text-xxs border border-slate-700">Ctrl + C</kbd>.</li>
              <li>قم بلصق محتويات الصفحة المنسوخة بالكامل في مربع الإدخال أدناه، وسيقوم الذكاء الاصطناعي باستخراج قائمة موادك ودرجاتك الفعلية وحقنها في لوحة التحكم الإحصائية فوراً بدلاً من البيانات التدريبية الافتراضية!</li>
            </ol>
          </div>

          <form onSubmit={handleHeithamSync} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-extrabold block">ألصق النص المنسوخ من حسابك هنا:</label>
              <textarea
                value={heithamText}
                onChange={(e) => setHeithamText(e.target.value)}
                placeholder="ألصق هنا جدول درجاتك، تقديراتك، أو بيان حالتك الذي قمت بنسخه من نظام ابن الهيثم الموحد..."
                className="w-full h-32 bg-[#09090D]/90 border border-slate-800 text-xs text-slate-200 p-3 rounded-2xl text-right focus:outline-none focus:border-violet-500/50 resize-y font-mono"
                dir="rtl"
              />
            </div>

            {heithamError && (
              <p className="text-xs text-red-400 font-bold bg-red-950/15 border border-red-500/20 p-3 rounded-xl">
                ⚠️ {heithamError}
              </p>
            )}

            {syncSuccessMsg && (
              <p className="text-xs text-emerald-400 font-bold bg-emerald-950/15 border border-emerald-500/20 p-3 rounded-xl leading-relaxed">
                ✅ {syncSuccessMsg}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isParsingHeitham}
                className="px-5 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-2 justify-center disabled:opacity-50"
              >
                {isParsingHeitham ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري تحليل وقراءة بيانات ابن الهيثم بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>بدء المزامنة والأرشفة الذكية 🚀</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {showingMockBuilder && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#181822] border border-blue-500/30 p-5 rounded-2xl text-right space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-805 pb-2">
            <span className="text-xs font-bold text-blue-400">إضافة علامة درجة اختبار لمحاكى الإحصائيات</span>
            <button 
              onClick={() => setShowingMockBuilder(false)}
              className="text-xs text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
          
          <form onSubmit={handleAddMockAttempt} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xxs text-slate-400 font-bold block">مادة الاختبار</label>
              <select
                value={mockSubject}
                onChange={(e) => setMockSubject(e.target.value)}
                className="w-full bg-[#0D0D10] border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl text-right cursor-pointer"
              >
                {predefinedSubjects.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xxs text-slate-400 font-bold block">الدرجة المحققة</label>
              <input
                type="number"
                min="0"
                max={mockTotal}
                required
                value={mockScore}
                onChange={(e) => setMockScore(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0D0D10] border border-slate-800 text-xs text-slate-200 p-2 rounded-xl text-right"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xxs text-slate-400 font-bold block">الدرجة الإجمالية (القصوى)</label>
              <input
                type="number"
                min="1"
                required
                value={mockTotal}
                onChange={(e) => setMockTotal(parseInt(e.target.value) || 10)}
                className="w-full bg-[#0D0D10] border border-slate-800 text-xs text-slate-200 p-2 rounded-xl text-right"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-2.5 rounded-xl cursor-pointer shadow transition"
            >
              تثبيت الاختبار وحساب الأداء
            </button>
          </form>
        </motion.div>
      )}

      {/* Main Stats Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Tests Card */}
        <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="text-right">
            <span className="text-xxs text-slate-500 font-bold">الاختبارات المنفذة والذاتية</span>
            <div className="text-2xl font-black text-white mt-1">{totalAttempts} <span className="text-xs text-slate-400 font-medium">امتحانات</span></div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
              <span>مسجلة بمتصفحك الفردي</span>
              <Activity className="h-3 w-3 text-blue-500" />
            </div>
          </div>
          <div className="p-3.5 bg-blue-600/10 text-blue-400 border border-blue-500/25 rounded-2xl">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Global Competency Card */}
        <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="text-right font-sans">
            <span className="text-xxs text-slate-500 font-bold">معدل التحصيل والمعدل التراكمي المقارب</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {avgPercentage}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
              <span>{avgPercentage >= 85 ? 'تقدير عام ممتاز' : avgPercentage >= 65 ? 'تقدير عام جيد جداً' : 'بحاجة للمزيد من المراجعة'}</span>
              <Award className="h-3 w-3 text-emerald-400" />
            </div>
          </div>
          <div className="p-3.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/25 rounded-2xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Strongest Subject Card */}
        <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="text-right">
            <span className="text-xxs text-slate-500 font-bold">نقطة القوة الأبرز</span>
            <div className="text-sm font-black text-white mt-2 truncate max-w-[150px]">
              {processedSubjects.length > 0
                ? [...processedSubjects].sort((a, b) => b.averagePercentage - a.averagePercentage)[0].subject
                : 'بانتظار القياس'}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              تحصيل مذهل بمستوى علمي فائق
            </div>
          </div>
          <div className="p-3.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/25 rounded-2xl">
            <BookMarked className="h-5 w-5" />
          </div>
        </div>

        {/* Recommendation Needed Area */}
        <div className="bg-[#14141A] p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="text-right">
            <span className="text-xxs text-slate-500 font-bold">المادة الأكثر تطلباً للمراجعة اليومية</span>
            <div className="text-sm font-black text-red-400 mt-2 truncate max-w-[150px]">
              {weakestSubjectObj ? weakestSubjectObj.subject : 'مستقر بامتياز'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              مستوى استيعاب {weakestSubjectObj ? `${weakestSubjectObj.averagePercentage}%` : 'كامل 100%'}
            </div>
          </div>
          <div className="p-3.5 bg-red-600/10 text-red-400 border border-red-500/25 rounded-2xl">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Analytical Visualizations / Charts Container */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left Column (Bar Chart and Score Trends): xl:col-span-12 lg:col-span-12 xl:col-span-7 */}
        <div className="xl:col-span-7 bg-[#14141A] p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="text-[10px] text-slate-500 bg-[#0D0D10] px-3 py-1 rounded-lg border border-slate-850 font-mono">
              Live Interactive Visual Graph
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">مستويات الأداء الدراسي حسب المقررات</h3>
              <BarChart2 className="h-4.5 w-4.5 text-blue-400" />
            </div>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">لا يوجد بيانات اختبارات متاحة لحساب المنحنيات</div>
          ) : (
            <div className="space-y-5">
              
              {/* Custom SVG Graphical Chart detailing Subject averages against thresholds */}
              <div className="bg-[#0D0D10] p-4 rounded-2xl border border-slate-900 space-y-4">
                
                {/* SVG Chart Axis Labels */}
                <div className="flex justify-between items-center text-xxs text-slate-500 font-bold px-1" dir="rtl">
                  <span>المادة الأكاديمية</span>
                  <div className="flex items-center gap-4">
                    <span>تحصيل ضعيف (0-50%)</span>
                    <span>تحصيل متوسط (50-75%)</span>
                    <span>تحصيل متميز (75-100%)</span>
                  </div>
                </div>

                <div className="space-y-4.5 pt-2">
                  {processedSubjects.map((subjectData, idx) => {
                    const isSelected = selectedSubject === subjectData.subject || (!selectedSubject && weakestSubjectObj?.subject === subjectData.subject);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedSubject(subjectData.subject)}
                        className={`space-y-1.5 cursor-pointer p-2.5 rounded-xl transition-all border ${
                          isSelected 
                            ? 'bg-blue-600/5 border-blue-500/40 shadow-sm' 
                            : 'border-transparent hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-[10px] text-slate-500 bg-[#14141A] px-2 py-0.5 rounded border border-slate-800">
                            {subjectData.attemptsCount} اختبارات
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xxs px-2 py-0.5 rounded font-bold" style={{
                              color: subjectData.levelInfo === 'excellent' ? '#34d399' : subjectData.levelInfo === 'very_good' ? '#60a5fa' : '#f87171',
                              backgroundColor: subjectData.levelInfo === 'excellent' ? 'rgba(52,211,153,0.1)' : subjectData.levelInfo === 'very_good' ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)'
                            }}>
                              {subjectData.levelInfo === 'excellent' ? 'ممتاز ⭐' : subjectData.levelInfo === 'very_good' ? 'جيد جداً ✨' : 'بحاجة لمتابعة ⚠️'}
                            </span>
                            <span className="font-bold text-white text-xs">{subjectData.subject}</span>
                          </div>
                        </div>

                        {/* Responsive Progress Bar */}
                        <div className="relative w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                          {/* Segment lines for visuals */}
                          <div className="absolute left-[50%] top-0 h-full w-0.5 bg-slate-800/80 z-10" />
                          <div className="absolute left-[75%] top-0 h-full w-0.5 bg-slate-800/80 z-10" />
                          
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${subjectData.averagePercentage}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${
                              subjectData.averagePercentage >= 85 
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                                : subjectData.averagePercentage >= 65 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-400' 
                                : 'bg-gradient-to-r from-red-600 to-red-400'
                            }`}
                          />
                        </div>

                        {/* Sub level values indicators on bar */}
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-mono">0%</span>
                          <span className="text-slate-500 font-mono">50%</span>
                          <span className="text-slate-500 font-mono">75%</span>
                          <span className="text-blue-400 font-black font-mono">{subjectData.averagePercentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Recharts Line Chart for Grade Evolution */}
              <div className="bg-[#0D0D10] p-4 rounded-2xl border border-slate-900 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-850 pb-3" dir="rtl">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h4 className="font-bold text-white text-xs">منحنى تطور الأداء والدرجات عبر الزمن (Line Chart)</h4>
                  </div>
                  
                  {/* Select menu to filter line chart subject evolution */}
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-[10px] text-slate-400 font-semibold font-sans">تصفية المادة:</span>
                    <select
                      value={evolutionSubject}
                      onChange={(e) => setEvolutionSubject(e.target.value)}
                      className="bg-[#14141A] border border-slate-800 rounded-lg text-[10px] text-slate-300 py-1 px-2.5 outline-none focus:border-blue-500 focus:text-white cursor-pointer"
                    >
                      <option value="all">الأداء العام (المواد مجتمعة)</option>
                      {processedSubjects.map((s, idx) => (
                        <option key={idx} value={s.subject}>{s.subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {lineChartData.length === 0 ? (
                  <p className="text-center py-6 text-slate-500 text-xxs">لا يوجد درجات مدونة لهذه المادة حالياً</p>
                ) : (
                  <div className="h-[220px] w-full relative" dir="ltr">
                    <svg 
                      viewBox={`0 0 ${svgW} ${svgH}`} 
                      className="w-full h-full overflow-visible"
                    >
                      {/* Grid Lines */}
                      {gridPercentages.map((pct) => {
                        const y = (svgH - padY) - (pct / 100) * drawH;
                        return (
                          <g key={pct}>
                            <line 
                              x1={padX} 
                              y1={y} 
                              x2={svgW - padX} 
                              y2={y} 
                              stroke="#1e293b" 
                              strokeWidth={1}
                              strokeDasharray="3 3"
                              opacity={0.6}
                            />
                            <text
                              x={padX - 8}
                              y={y + 3}
                              fill="#64748b"
                              fontSize={9}
                              textAnchor="end"
                              fontFamily="monospace"
                            >
                              {pct}%
                            </text>
                          </g>
                        );
                      })}

                      {/* X-Axis labels & marks */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <line 
                            x1={p.x} 
                            y1={svgH - padY} 
                            x2={p.x} 
                            y2={svgH - padY + 4} 
                            stroke="#1e293b" 
                            strokeWidth={1}
                          />
                          <text
                            x={p.x}
                            y={svgH - padY + 14}
                            fill="#64748b"
                            fontSize={8}
                            textAnchor="middle"
                          >
                            {p.data.pointKey}
                          </text>
                        </g>
                      ))}

                      {/* Area Under Line (Gradient Fill) */}
                      {points.length > 0 && (
                        <>
                          <defs>
                            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} ${svgH - padY} L ${points[0].x} ${svgH - padY} Z`}
                            fill="url(#chartAreaGradient)"
                          />
                        </>
                      )}

                      {/* Line Path */}
                      {points.length > 0 && (
                        <path
                          d={`M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                        />
                      )}

                      {/* Glowing Hoverable/Interactive Points */}
                      {points.map((p, i) => {
                        const isHovered = hoveredPointIndex === i;
                        return (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 6 : 4}
                            fill={isHovered ? "#38bdf8" : "#14141a"}
                            stroke="#3b82f6"
                            strokeWidth={isHovered ? 2.5 : 2}
                            className="cursor-pointer transition-all duration-150"
                            onMouseEnter={() => setHoveredPointIndex(i)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Interactive Overlay Tooltip absolute-positioned to SVG coordinates % */}
                    {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                      <div
                        className="absolute pointer-events-none transition-all duration-150 z-50 text-right"
                        style={{
                          left: `${(points[hoveredPointIndex].x / svgW) * 100}%`,
                          top: `${(points[hoveredPointIndex].y / svgH) * 100}%`,
                          transform: 'translate(-50%, -115%)',
                        }}
                      >
                        <div className="bg-[#141419]/95 backdrop-blur-md border border-slate-800 p-3 py-2.5 rounded-xl shadow-2xl text-right space-y-1 text-xs whitespace-nowrap min-w-[190px]">
                          <p className="font-extrabold text-[#38bdf8] text-xs pb-1 border-b border-slate-800/60 font-sans" dir="rtl">
                            {points[hoveredPointIndex].data.المادة}
                          </p>
                          <p className="text-slate-300 font-medium text-[10px] leading-relaxed max-w-[180px] pt-1 whitespace-normal text-right font-sans" dir="rtl">
                            {points[hoveredPointIndex].data.المحاضرة}
                          </p>
                          <div className="flex items-center gap-1.5 justify-end font-mono border-t border-slate-800/80 pt-1 mt-1">
                            <span className="text-emerald-400 font-black text-xs">{points[hoveredPointIndex].data.النسبة}%</span>
                            <span className="text-slate-500 text-[10px] font-sans">الأداء:</span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end font-mono">
                            <span className="text-[#38bdf8] font-bold text-xxs">{points[hoveredPointIndex].data.الدرجة}</span>
                            <span className="text-slate-500 text-[10px] font-sans">التقدير الفعلي:</span>
                          </div>
                          <div className="text-slate-500 text-[9px] mt-1 text-left font-mono" dir="ltr">
                            {points[hoveredPointIndex].data.التاريخ}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans border-t border-slate-900 pt-2" dir="rtl">
                  <span>محور س: تسلسل قياس المحاولات</span>
                  <span>محور ص: مستويات تحصيل الدرجة الأساسية (%)</span>
                </div>
              </div>

              {/* Informative Guidance */}
              <div className="p-4 bg-blue-950/10 border border-blue-500/10 rounded-2xl flex items-start gap-3 text-right">
                <Lightbulb className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-300">نصيحة تفاعلية أكاديمية:</span>
                  <p className="text-xxs text-slate-300 leading-relaxed">
                    انقر فوق أي مقرر دراسي في الرسم البياني أعلاه لمشاهدة تفصيل تقني فوري لمواطن الصعوبة والسهولة التي يواجهها الطالب "فتحي الكيلاني" وإرشادات الذكاء الاصطناعي لتجاوزها.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right Column (Strength vs. Weakness drilldown): xl:col-span-12 lg:col-span-12 xl:col-span-5 */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Active Diagnostic Advisor */}
          <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 flex-1 space-y-4 text-right">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xxs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                Academic Advisor Engine
              </span>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">تشخيص مواطن القوة والضعف والحلول</h3>
                <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
              </div>
            </div>

            {activeAnalysis ? (
              <div className="space-y-5 font-sans text-xs">
                
                {/* Active Subject header info */}
                <div className="bg-[#0D0D10] p-3 rounded-xl border border-slate-900 flex justify-between items-center">
                  <div className="text-left font-mono">
                    <span className="text-emerald-400 font-extrabold">{activeAnalysis.averagePercentage}%</span>
                    <span className="text-[10px] text-slate-500 block">مرجع الكفاءة</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">التحليل التفصيلي لمقرر:</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{activeAnalysis.subject}</h4>
                  </div>
                </div>

                {/* Highly structured lists of strengths and weaknesses */}
                <div className="space-y-3.5">
                  
                  {/* Strengths List (Points of strength) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 justify-end text-emerald-400 font-bold">
                      <span>نقاط القوة المستوعبة والمكتسبة ⭐</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <ul className="space-y-1.5 bg-emerald-950/10 border border-emerald-500/15 p-3 rounded-xl text-slate-200">
                      {activeAnalysis.strongTopics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-1.5 justify-end text-xxs leading-relaxed">
                          <span className="text-right">{topic}</span>
                          <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses List (Points of improvement and difficulty) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 justify-end text-red-400 font-bold">
                      <span>نقاط الضعف ومواطن التركيز العاجل ⚠️</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    </div>
                    <ul className="space-y-1.5 bg-red-950/10 border border-red-500/15 p-3 rounded-xl text-slate-200">
                      {activeAnalysis.weakTopics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-1.5 justify-end text-xxs leading-relaxed">
                          <span className="text-right">{topic}</span>
                          <AlertCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Custom Recommendations Block */}
                <div className="bg-[#0D0D10] p-4 rounded-xl border border-slate-900 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 block">الإجراء الطبي الطبي لرفع الاستحقاق والدرجة:</span>
                  <p className="text-xxs leading-relaxed text-slate-300">{activeAnalysis.recommendation}</p>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">قم بتزويد اختبارات لتوليد تشخيص أكاديمي</div>
            )}

          </div>

        </div>

      </div>

      {/* Chronological Test History Log */}
      <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 space-y-4 text-right">
        
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <span className="text-[10px] text-slate-500 font-mono">Academic Records Database</span>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm">سجل المحاولات ونتائج الاختبارات الذاتية</h3>
            <Calendar className="h-4.5 w-4.5 text-blue-400" />
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs text-center">لا يوجد اختبارات مدونة بسجلك بمتصفحك الحالي</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 text-xxs font-bold">
                  <th className="py-2.5 text-center px-2">الإجراءات</th>
                  <th className="py-2.5 text-center px-2">مستوى التحدي</th>
                  <th className="py-2.5 text-center px-2">التحصيل الرقمي</th>
                  <th className="py-2.5 text-center px-2">تاريخ الاختبار</th>
                  <th className="py-2.5 px-4">موضوع ومحاكاة المحاضرة</th>
                  <th className="py-2.5 px-4">المادة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="text-slate-200 hover:bg-slate-900/30 transition-all">
                    
                    <td className="py-3 text-center px-2">
                      <button
                        onClick={() => handleDeleteAttempt(attempt.id)}
                        className="p-1 px-2.5 bg-red-600/10 text-red-400 hover:bg-red-600/20 text-xxs font-bold rounded-lg cursor-pointer transition"
                      >
                        حذف السجل
                      </button>
                    </td>

                    <td className="py-3 text-center px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        attempt.level === 'deep_challenge' 
                          ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {attempt.level === 'deep_challenge' ? 'تحدي عميق' : 'قياسي'}
                      </span>
                    </td>

                    <td className="py-3 text-center px-2">
                      <div className="flex flex-col items-center justify-center font-mono">
                        <span className={`font-black ${
                          attempt.percentage >= 85 ? 'text-emerald-400' : attempt.percentage >= 60 ? 'text-blue-400' : 'text-red-400'
                        }`}>
                          {attempt.percentage}%
                        </span>
                        <span className="text-[9px] text-slate-500">({attempt.score} / {attempt.total})</span>
                      </div>
                    </td>

                    <td className="py-3 text-center px-2 font-mono text-[10px] text-slate-400">
                      {new Date(attempt.timestamp).toLocaleDateString('ar-EG', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4 font-semibold text-xxs text-right leading-relaxed max-w-sm truncate" dir="rtl">
                      {attempt.lectureName}
                    </td>

                    <td className="py-3 px-4 text-xs font-black text-white text-right">
                      {attempt.subject}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
