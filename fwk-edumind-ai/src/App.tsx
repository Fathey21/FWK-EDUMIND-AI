/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, LectureSummary } from './types';
import LoginPortal from './components/LoginPortal';
import SummarizerPanel from './components/SummarizerPanel';
import ExamSolverPanel from './components/ExamSolverPanel';
import QuestionsPanel from './components/QuestionsPanel';
import CommitteeLocator from './components/CommitteeLocator';
import NotificationsTracker from './components/NotificationsTracker';
import InstructionsPanel from './components/InstructionsPanel';
import AboutPanel from './components/AboutPanel';
import HelpFeedbackPanel from './components/HelpFeedbackPanel';
import StudentDashboard from './components/StudentDashboard';

import { 
  GraduationCap, LogOut, FileText, HelpCircle, 
  MapPin, Bell, User, Sparkles, BookCheck, ShieldCheck,
  BookOpen, Info, LifeBuoy, BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';

type TabType = 'dashboard' | 'summarizer' | 'solver' | 'quizzes' | 'locator' | 'alerts' | 'instructions' | 'about' | 'help';

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [committeeData, setCommitteeData] = useState<any | null>(null);
  const [currentSummary, setCurrentSummary] = useState<LectureSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const handleLoginSuccess = (studentInfo: Student, data: any) => {
    setStudent(studentInfo);
    setCommitteeData(data);
  };

  const handleLogout = () => {
    setStudent(null);
    setCommitteeData(null);
    setCurrentSummary(null);
    setActiveTab('dashboard');
  };

  const handleSummaryGenerated = (summary: LectureSummary) => {
    setCurrentSummary(summary);
  };

  if (!student) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="app_root_wrapper" className="min-h-screen bg-[#0A0A0B] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Professional Academic Header */}
      <header id="academic_top_header" className="h-16 border-b border-slate-800 bg-[#111114] sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4 text-right">
        
        {/* Student actions and logout */}
        <div className="flex items-center gap-4 order-2 md:order-1 w-full md:w-auto justify-between md:justify-start">
          <button
            id="user_logout_btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-[#14141A] hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-bold text-xs rounded-xl border border-slate-800 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>تسجيل الخروج</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">ID: {student.academicId}</div>
              <span className="text-xs text-slate-400 font-bold font-sans">الكلية: {student.college.split(' - ')[0]}</span>
            </div>
            <div className="w-8 h-8 rounded-full border border-blue-500/30 p-0.5">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xxs text-white">
                {student.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-3 order-1 md:order-2 w-full md:w-auto justify-end">
          <div className="text-right">
            <h1 className="text-md md:text-lg font-bold tracking-tight text-white leading-normal flex items-center gap-2 justify-end">
              <span className="text-[10px] font-bold text-blue-500 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">AI PRO</span>
              <span>مساعد المحاضرات والامتحانات الذكي</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">مرحباً بك مجدداً، الطالب المعتمد: <span className="text-blue-400 font-bold">{student.name}</span></p>
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
        </div>

      </header>

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div id="navigation_tabs_toolbar" className="flex items-center justify-end border-b border-slate-850 pb-1 w-full overflow-x-auto gap-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('help')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'help'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>المساعدة والملاحظات</span>
            <LifeBuoy className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>عن التطبيق والملكية</span>
            <Info className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>إرشادات الكليات</span>
            <BookOpen className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>التنبيهات وجدول الامتحانات</span>
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locator')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'locator'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>خريطة لجان الامتحانات</span>
            <MapPin className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'quizzes'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>الامتحانات الذكية</span>
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('solver')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'solver'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>حل وشرح الامتحانات</span>
            <BookCheck className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summarizer')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'summarizer'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>تلخيص المحاضرات والملخصات</span>
            <FileText className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-5 font-bold text-xs transition-all border-b-2 flex items-center justify-end gap-2 shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <span>لوحة الأداء الإحصائي</span>
            <BarChart2 className="h-4 w-4" />
          </button>

        </div>

        {/* Tab Render View area with transition */}
        <div id="tab_render_outer_pane" className="min-h-[480px]">
          {activeTab === 'dashboard' && (
            <StudentDashboard 
              college={student.college}
            />
          )}

          {activeTab === 'summarizer' && (
            <SummarizerPanel 
              college={student.college} 
              onSummaryGenerated={handleSummaryGenerated}
              currentSummary={currentSummary}
              setCurrentSummary={setCurrentSummary}
            />
          )}

          {activeTab === 'solver' && (
            <ExamSolverPanel 
              college={student.college}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuestionsPanel 
              currentSummary={currentSummary} 
              college={student.college}
            />
          )}

          {activeTab === 'locator' && (
            <CommitteeLocator 
              committeeData={committeeData} 
              studentName={student.name}
            />
          )}

          {activeTab === 'alerts' && (
            <NotificationsTracker 
              college={student.college}
            />
          )}

          {activeTab === 'instructions' && (
            <InstructionsPanel />
          )}

          {activeTab === 'about' && (
            <AboutPanel />
          )}

          {activeTab === 'help' && (
            <HelpFeedbackPanel />
          )}
        </div>

      </main>

      {/* Corporate Branded Slate Footer */}
      <footer id="app_desk_footer" className="bg-[#111114] border-t border-slate-800 text-slate-500 py-6 text-center text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left text-[10px] mb-2 md:mb-0">
            Powered by Google AI Studio & Gemini 3.5 Flash
          </div>
          <div className="text-center font-sans tracking-wide">
            منصة مساعد المحاضرات والخرائط الجامعية الذكية المتكاملة لجميع الكليات © 2026
          </div>
        </div>
      </footer>

    </div>
  );
}
