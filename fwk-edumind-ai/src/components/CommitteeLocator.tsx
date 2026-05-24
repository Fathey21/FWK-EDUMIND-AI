/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ExamCommittee } from '../types';
import { 
  MapPin, ShieldAlert, Navigation, Search, 
  Map, Printer, Compass, Calendar, Clock, Sparkles 
} from 'lucide-react';
import { menoufiaExams } from '../data';

interface CommitteeLocatorProps {
  committeeData: ExamCommittee | null;
  studentName: string;
}

export default function CommitteeLocator({ committeeData, studentName }: CommitteeLocatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searching, setSearching] = useState(false);
  const [highlightedPoint, setHighlightedPoint] = useState<number | null>(null);

  const [selectedLevel, setSelectedLevel] = useState<string>('المستوى الثالث');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Synchronize level and department with logged in student if applicable
  useEffect(() => {
    if (committeeData) {
      // Find matching exam block if exists to set level
      const matching = menoufiaExams.find(ex => ex.subject.toLowerCase().includes(committeeData.hallName.toLowerCase()) || committeeData.college?.includes(ex.level));
      if (matching) {
        setSelectedLevel(matching.level);
        if (matching.department !== 'عام') {
          setSelectedDept(matching.department);
        }
      } else {
        // Fallback checks
        if (committeeData.buildingName?.includes('الرابع') || committeeData.floor?.includes('الرابع')) {
          setSelectedLevel('المستوى الرابع');
        } else if (committeeData.buildingName?.includes('الثاني') || committeeData.floor?.includes('الثاني')) {
          setSelectedLevel('المستوى الثالث');
        } else if (committeeData.buildingName?.includes('الأول') || committeeData.floor?.includes('الأول')) {
          setSelectedLevel('المستوى الثاني');
        } else if (committeeData.buildingName?.includes('الأرضي') || committeeData.floor?.includes('الأرضي')) {
          setSelectedLevel('المستوى الأول');
        }
      }
    }
  }, [committeeData]);

  // Filter exams by selected level and department
  const filteredExams = menoufiaExams.filter(exam => {
    const matchesLevel = exam.level === selectedLevel;
    const matchesDept = selectedDept === 'all' || exam.department === 'عام' || exam.department === selectedDept;
    return matchesLevel && matchesDept;
  });

  const [activeExam, setActiveExam] = useState<any>(() => {
    if (committeeData) {
      return committeeData;
    }
    // Default to first Level 3 exam
    return {
      ...menoufiaExams.find(ex => ex.level === 'المستوى الثالث') || menoufiaExams[0],
      studentId: "123456",
      studentName: studentName || "فتحي الكيلاني",
      nationalId: "29904250109876",
      instructions: [
        "يرجى الحضور قبل موعد الامتحان بـ 30 دقيقة على الأقل.",
        "ممنوع استخدام الهاتف المحمول أو الساعات الذكية تماماً في اللجنة.",
        "احرص على إحضار الحاسب المحمول الشخصي إذا تطلب الامتحان العملي ذلك."
      ]
    };
  });

  // Sync activeExam if level/filteredExams changes and current activeExam is not in list
  useEffect(() => {
    if (filteredExams.length > 0 && !committeeData) {
      // Only swap if current activeExam's level does not match selectedLevel
      if (activeExam?.level && activeExam.level !== selectedLevel) {
        setActiveExam({
          ...filteredExams[0],
          studentId: "123456",
          studentName: studentName || "فتحي الكيلاني",
          nationalId: "29904250109876",
          instructions: [
            "يرجى الحضور قبل موعد الامتحان بـ 30 دقيقة على الأقل.",
            "ممنوع استخدام الهاتف المحمول أو الساعات الذكية تماماً في اللجنة.",
            "احرص على إحضار الحاسب المحمول الشخصي إذا تطلب الامتحان العملي ذلك."
          ]
        });
      }
    }
  }, [selectedLevel, filteredExams, studentName, committeeData]);

  const handleSearchHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResult('');
    
    try {
      const response = await fetch('/api/find-hall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          college: activeExam?.college || 'الكلية'
        })
      });

      const data = await response.json();
      setSearchResult(data.text);
    } catch (err) {
      setSearchResult('فشل في العثور على المسار الملاحي بدقة، يرجى التوجه لمبنى شؤون الطلاب الرئيسي للاستعلام.');
    } finally {
      setSearching(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  // SVG dimensions for the interactive vector map
  const svgWidth = 600;
  const svgHeight = 400;

  return (
    <div id="committee_locator_wrapper" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans text-right">
      
      {/* Visual Vector SVG Campus Map and Navigation */}
      <div id="committee_map_col" className="lg:col-span-12 xl:col-span-7 space-y-6">
        
        <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-right gap-3">
            <button
              type="button"
              onClick={triggerPrint}
              className="bg-[#0D0D10] hover:bg-slate-900 border border-slate-805 hover:border-slate-700 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4 text-blue-400" />
              <span>استخراج وطباعة خريطة اللجنة</span>
            </button>
            <div className="flex items-center gap-2.5 justify-end">
              <h3 className="font-bold text-white text-base">الخريطة التفاعلية للحرم الجامعي</h3>
              <div className="w-8 h-8 bg-blue-600/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
                <Map className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-[#09090D] flex justify-center items-center shadow-inner">
            
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto text-slate-600 select-none max-h-[380px]"
            >
              {/* Background Map Grid Pattern */}
              <defs>
                <pattern id="map_grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(51, 65, 85, 0.1)" strokeWidth="1" />
                </pattern>
                
                {/* Glow/Pulse effects for line and committee desk */}
                <filter id="route_glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#map_grid)" />

              {/* Background University Layout Shapes */}
              {/* Central Greenery */}
              <ellipse cx="300" cy="200" rx="90" ry="50" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.5" />
              <text x="300" y="205" fill="rgba(16, 185, 129, 0.4)" fontSize="11" textAnchor="middle" className="font-semibold">ساحة المسلة والحدائق المركزية</text>

              {/* Campus Boundary Walls */}
              <rect x="5" y="5" width="590" height="390" rx="10" fill="none" stroke="rgba(148, 163, 184, 0.05)" strokeWidth="3" />

              {/* Mapped University Buildings (Blocks) */}
              {/* Gate 1 Block */}
              <rect x="20" y="340" width="80" height="40" rx="6" fill="#14141A" stroke="rgba(71, 85, 105, 0.4)" />
              <text x="60" y="364" fill="rgba(148, 163, 184, 0.6)" fontSize="10" textAnchor="middle">البوابة الرئيسية 1</text>

              {/* Gate 3 / 4 Block */}
              <rect x="15" y="20" width="80" height="40" rx="6" fill="#14141A" stroke="rgba(71, 85, 105, 0.4)" />
              <text x="55" y="44" fill="rgba(148, 163, 184, 0.6)" fontSize="10" textAnchor="middle">البوابة الفرعية</text>

              {/* Admin Office Block */}
              <rect x="420" y="30" width="130" height="60" rx="8" fill="#14141A" stroke="rgba(100, 116, 139, 0.3)" />
              <text x="485" y="55" fill="#cbd5e1" fontSize="11" textAnchor="middle" className="font-bold">المبنى الإداري والمالي</text>
              <text x="485" y="75" fill="#94a3b8" fontSize="9" textAnchor="middle">رئاسة الكلية وشؤون الطلاب</text>

              {/* Engineering Labs / Science Building */}
              <rect x="410" y="300" width="160" height="70" rx="8" fill="#14141A" stroke="rgba(100, 116, 139, 0.3)" />
              <text x="490" y="328" fill="#cbd5e1" fontSize="11" textAnchor="middle" className="font-bold">مجمع المدرجات المركزي</text>
              <text x="490" y="350" fill="#94a3b8" fontSize="9" textAnchor="middle">قاعات الامتحان والمعامل د/هـ</text>

              {/* Old Traditional Lecture Block */}
              <rect x="180" y="40" width="150" height="50" rx="6" fill="#14141A" stroke="rgba(71, 85, 105, 0.3)" />
              <text x="255" y="70" fill="rgba(148, 163, 184, 0.6)" fontSize="10" textAnchor="middle">المجمع الجنوبي للأبحاث</text>

              {/* Interactive highlighted path overlay */}
              {activeExam && activeExam.mapPathPoints && activeExam.mapPathPoints.length > 0 && (
                <>
                  {/* Glowing Animated line connector */}
                  <path 
                    d={activeExam.mapPathPoints.reduce((acc: string, p: any, idx: number) => {
                      return acc + (idx === 0 ? `M ${p.x * 6} ${p.y * 4}` : ` L ${p.x * 6} ${p.y * 4}`);
                    }, '')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#route_glow)"
                    className="animate-pulse"
                  />
                  {/* Dash progress line overlay that slides towards the committee */}
                  <path 
                    d={activeExam.mapPathPoints.reduce((acc: string, p: any, idx: number) => {
                      return acc + (idx === 0 ? `M ${p.x * 6} ${p.y * 4}` : ` L ${p.x * 6} ${p.y * 4}`);
                    }, '')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Nodes along the map */}
                  {activeExam.mapPathPoints.map((pt: any, idx: number) => {
                    const isLast = idx === activeExam.mapPathPoints.length - 1;
                    const isFirst = idx === 0;

                    return (
                      <g 
                        key={idx} 
                        className="cursor-pointer transition duration-300"
                        onMouseEnter={() => setHighlightedPoint(idx)}
                        onMouseLeave={() => setHighlightedPoint(null)}
                      >
                        {/* Interactive circle */}
                        <circle 
                          cx={pt.x * 6} 
                          cy={pt.y * 4} 
                          r={isLast ? "11" : (highlightedPoint === idx ? "8" : "6")} 
                          fill={isLast ? "#ef4444" : (isFirst ? "#10b981" : "#3b82f6")}
                          className={isLast ? "animate-pulse" : ""}
                        />
                        {isLast && (
                          <circle 
                            cx={pt.x * 6} 
                            cy={pt.y * 4} 
                            r="18" 
                            fill="none" 
                            stroke="#ef4444" 
                            strokeWidth="1.5" 
                            className="animate-ping opacity-60" 
                          />
                        )}
                        {/* Mini tooltip index indicator */}
                        <circle cx={pt.x * 6} cy={pt.y * 4} r="3" fill="#ffffff" />
                        
                        {/* Anchor point text labels inside map */}
                        {(highlightedPoint === idx || isLast || isFirst) && (
                          <g>
                            <rect 
                              x={pt.x * 6 - 65} 
                              y={pt.y * 4 - 28} 
                              width="130" 
                              height="20" 
                              rx="4" 
                              fill="#0D0D10" 
                              stroke="rgba(148,163,184,0.15)" 
                              strokeWidth="0.8" 
                            />
                            <text 
                              x={pt.x * 6} 
                              y={pt.y * 4 - 15} 
                              fill="#f8fafc" 
                              fontSize="8.5" 
                              textAnchor="middle" 
                              className="font-bold font-sans"
                            >
                              {pt.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {/* Custom map direction instructions overlay */}
            <div className="absolute bottom-3 right-3 bg-[#0D0D10]/95 border border-slate-800 p-2.5 rounded-xl text-xxs flex items-center gap-1.5 text-slate-300 max-w-[215px] backdrop-blur-sm">
              <Compass className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>قم بالوقوف على النقاط الدائرية بالخريطة لتتبع مسارك الحركي الموجه للامتحان.</span>
            </div>
          </div>

          {/* Sequential Instructions map path list */}
          {activeExam && (
            <div className="space-y-2 text-right">
              <span className="text-slate-500 text-xs font-bold font-mono">STEP-BY-STEP campus NAVIGATION</span>
              <div className="flex flex-col gap-2">
                {activeExam.mapPathPoints.map((pt: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 bg-[#0D0D10]/40 p-2.5 rounded-xl border border-slate-800/60 justify-end"
                  >
                    <span className="text-xs text-slate-200">{pt.label}</span>
                    <span className="text-xxs font-mono bg-[#0D0D10] border border-slate-800 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                      الخطوة {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* College Identity and Exam Committee Details Panel */}
      <div id="committee_details_col" className="lg:col-span-12 xl:col-span-5 space-y-6">
        
        {/* Verification Credentials Card */}
        {activeExam ? (
          <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 shadow-lg space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md font-bold">
                لجنة امتحانية نشطة
              </span>
              <div className="text-right">
                <h4 className="font-bold text-white text-base leading-none">{studentName || "فتحي كيلاني"}</h4>
                <span className="text-xs text-slate-400 mt-2 block">الرقم الأكاديمي: {activeExam.studentId}</span>
              </div>
            </div>

            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0D0D10] p-3.5 rounded-xl border border-slate-800/70 text-right space-y-1">
                  <span className="text-xxs text-slate-500 font-semibold block">مقر اللجنة والقاعة</span>
                  <p className="text-xs text-white font-bold leading-normal">{activeExam.hallName}</p>
                </div>
                <div className="bg-[#0D0D10] p-3.5 rounded-xl border border-slate-800/70 text-right space-y-1">
                  <span className="text-xxs text-slate-500 font-semibold block">رقم ورقة المقعد (الجلوس)</span>
                  <p className="text-sm text-blue-400 font-extrabold font-mono">{activeExam.seatNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0D0D10] p-3.5 rounded-xl border border-slate-800/70 text-right space-y-1">
                  <span className="text-xxs text-slate-500 font-semibold block">مبنى الكلية والموقع</span>
                  <p className="text-xs text-slate-200 font-bold">{activeExam.buildingName}</p>
                </div>
                <div className="bg-[#0D0D10] p-3.5 rounded-xl border border-slate-800/70 text-right space-y-1">
                  <span className="text-xxs text-slate-500 font-semibold block">الدور الهندسي للطابق</span>
                  <p className="text-xs text-slate-200 font-bold">{activeExam.floor}</p>
                </div>
              </div>

              <div className="bg-[#0D0D10] p-4 rounded-xl border border-slate-850 text-right flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs font-bold">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>{activeExam.examTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs font-bold">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span>{activeExam.examDate}</span>
                </div>
              </div>

            </div>

            {/* Official Instructions */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <span>التعليمات والضوابط الرسمية للامتحان</span>
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              </h5>
              <ul className="space-y-1 text-xs text-slate-400 leading-relaxed pr-1 list-disc list-inside">
                {activeExam.instructions && activeExam.instructions.map((inst: string, idx: number) => (
                  <li key={idx} className="text-right leading-relaxed list-none bg-[#0D0D10]/40 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-amber-500 font-extrabold pr-1">!</span> {inst}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <div className="bg-[#14141A]/50 p-6 rounded-3xl border border-slate-850 border-dashed text-center text-slate-400 text-xs">
            تأكد من تسجيل هويتك الأكاديمية للدخول وعرض بيانات وتخطيط مقعدك.
          </div>
        )}

        {/* AI Campus Assistant Search Panel */}
        <div id="ai_campus_assistant_search" className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 space-y-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <h4 className="font-bold text-white text-sm">البحث الإرشادي للكلية والمدرج</h4>
            <Sparkles className="h-4.5 w-4.5 text-blue-400 shrink-0" />
          </div>
          <p className="text-slate-400 text-xs leading-relaxed font-sans">
            أكتب اسم أي معلم أو مدرج بداخل الجامعة، وسيقوم المرشد الجامعي الذكي برسم مسار حركي إرشادي فوري لك في مدرجات الكليات.
          </p>

          <form onSubmit={handleSearchHall} className="relative flex items-center">
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مثال: قاعة مجلس الكلية، مدرج الهيدروليكا"
              className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-12 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-sans"
            />
            <Search className="absolute right-4 h-4 w-4 text-slate-500" />
            <button
              id="search_hall_btn"
              type="submit"
              disabled={searching}
              className="absolute left-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xxs transition cursor-pointer"
            >
              {searching ? 'جاري البحث...' : 'ابحث عن الموقع'}
            </button>
          </form>

          {/* Assistant Response Box */}
          {searchResult && (
            <div className="p-4 bg-[#09090D] border border-slate-800 rounded-xl space-y-2">
              <div className="text-[10px] text-emerald-400 font-bold font-mono">CAMPUS GUIDE DIRECTIONS</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line text-right">
                {searchResult}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* College Exam Timetable (جدول امتحانات الكلية) */}
      <div className="col-span-12 bg-[#14141A] p-6 rounded-3xl border border-slate-800 space-y-4 text-right">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-slate-850 pb-4 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Level Selector */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-500 font-bold">المستوى الأكاديمي (الفرقة)</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-[#0D0D10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="المستوى الأول">المستوى الأول (الفرقة الأولى)</option>
                <option value="المستوى الثاني">المستوى الثاني (الفرقة الثانية)</option>
                <option value="المستوى الثالث">المستوى الثالث (الفرقة الثالثة)</option>
                <option value="المستوى الرابع">المستوى الرابع (الفرقة الرابعة)</option>
              </select>
            </div>

            {/* Department Selector */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-500 font-bold">التخصص / القسم العلمي</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#0D0D10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">الكل (المقررات العامة والمشتركة)</option>
                <option value="CS">علوم الحاسب (CS)</option>
                <option value="IS">نظم المعلومات (IS)</option>
                <option value="IT">تكنولوجيا المعلومات (IT)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <h3 className="font-bold text-white text-base">جدول لجان امتحانات الكلية وتوزيع المقاعد لعام 2026</h3>
            <div className="p-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed max-w-4xl font-sans">
          توزيع لجان امتحانات الكلية لـ <strong className="text-blue-400">{selectedLevel}</strong> لعام 2026. انقر فوق <strong>"عرض اللجنة والمسار 🗺️"</strong> لأي مادة دراسية ليقوم المحرك الملاحي التفاعلي بالأعلى بتخطيط الطابق وتأكيد المقعد فورياً.
        </p>

        <div className="overflow-x-auto pt-2">
          {filteredExams.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              لا توجد امتحانات مخصصة لهذا التخصص في هذا المستوى الأكاديمي حالياً. اختر تخصص آخر أو مقرر عام.
            </div>
          ) : (
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xxs font-bold">
                  <th className="py-3 px-4 text-center">الإجراء الملاحي التفاعلي</th>
                  <th className="py-3 px-4 text-center">حالة اللجنة</th>
                  <th className="py-3 px-4 text-right">رقم المقعد</th>
                  <th className="py-3 px-4 text-right">مقر اللجنة والقاعة</th>
                  <th className="py-3 px-4 text-right">التاريخ والوقت</th>
                  <th className="py-3 px-4 text-right">المادة الدراسية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredExams.map((exam: any, idx: number) => {
                  const isSelected = activeExam?.subject === exam.subject;
                  return (
                    <tr 
                      key={idx} 
                      className={`transition-all ${
                        isSelected 
                          ? 'bg-blue-600/10 text-white font-bold' 
                          : 'text-slate-300 hover:bg-slate-900/30'
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveExam({
                              ...exam,
                              studentId: committeeData?.studentId || "123456",
                              studentName: studentName || "فتحي كيلاني",
                              nationalId: committeeData?.nationalId || "29904250109876",
                              instructions: committeeData?.instructions || [
                                "يرجى الحضور قبل موعد الامتحان بـ 30 دقيقة على الأقل.",
                                "ممنوع استخدام الهاتف المحمول أو الساعات الذكية تماماً في اللجنة.",
                                "احرص على إحضار الحاسب المحمول الشخصي إذا تطلب الامتحان العملي ذلك."
                              ],
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20'
                          }`}
                        >
                          {isSelected ? 'اللجنة نشطة بالخريطة ✓' : 'عرض اللجنة والمسار 🗺️'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          idx === 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' 
                            : 'bg-slate-800/15 text-slate-400 border border-slate-750'
                        }`}>
                          {idx === 0 ? 'اللجنة الأولى' : 'لجنة مجدولة'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-xs text-blue-400 text-right">
                        {exam.seatNumber}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-right">
                        <div className="flex flex-col items-end">
                          <span>{exam.hallName}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{exam.floor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-[11px] text-slate-200">{exam.examDate}</span>
                          <span className="text-[10px] text-slate-400">{exam.examTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-200 text-xs text-right">
                        {exam.subject}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
