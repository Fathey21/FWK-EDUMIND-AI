/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertNotification } from '../types';
import { 
  Bell, Calendar, Plus, Clock, Trash2, 
  Check, Play, AlertCircle, Volume2 
} from 'lucide-react';

interface NotificationsTrackerProps {
  college: string;
}

export default function NotificationsTracker({ college }: NotificationsTrackerProps) {
  const [alerts, setAlerts] = useState<AlertNotification[]>([
    {
      id: 'alert_1',
      title: 'امتحان العملي النهائي (مادة الخرسانة المسلحة)',
      dateTime: '2026-05-24T00:00:00.000Z', // Close to current mock date 
      subject: 'خرسانة مسلحة وقوى',
      type: 'exam',
      alertTimeOffsetMin: 30,
      isNotified: false
    },
    {
      id: 'alert_2',
      title: 'تسليم ملخص الذكاء الاصطناعي الأسبوعي',
      dateTime: '2026-05-30T10:00:00.000Z',
      subject: 'ذكاء اصطناعي ونظم مدمجة',
      type: 'submission',
      alertTimeOffsetMin: 15,
      isNotified: false
    }
  ]);

  // Alert Creation Form
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<'quiz' | 'exam' | 'submission'>('exam');
  
  // Real-time ticking system alarm
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check for triggered alarms
      alerts.forEach((alert) => {
        if (!alert.isNotified) {
          const alertTime = new Date(alert.dateTime);
          const diffMs = alertTime.getTime() - now.getTime();
          
          // Trigger if time is up, or within threshhold
          if (diffMs <= 0 && diffMs > -3600000) { 
            triggerUiNotification(alert);
          }
        }
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [alerts]);

  const triggerUiNotification = (alert: AlertNotification) => {
    setActiveNotification(alert.title);
    
    // Mark as notified in state
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) =>
        a.id === alert.id ? { ...a, isNotified: true } : a
      )
    );
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newTime) {
      alert('الرجاء تعبئة بيانات التنبيه بالكامل');
      return;
    }

    const isoDateTimeString = `${newDate}T${newTime}:00.000Z`;

    const freshAlert: AlertNotification = {
      id: `alert_${Date.now()}`,
      title: newTitle,
      subject: newSubject || 'المادة العامة',
      dateTime: isoDateTimeString,
      type: newType,
      alertTimeOffsetMin: 30,
      isNotified: false
    };

    setAlerts([freshAlert, ...alerts]);
    
    // Reset Form
    setNewTitle('');
    setNewSubject('');
    setNewDate('');
    setNewTime('');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  // Helper calculation for live ticking days/hours countdown
  const getCountdownString = (isoString: string) => {
    const target = new Date(isoString).getTime();
    const now = currentTime.getTime();
    const diff = target - now;

    if (diff <= 0) {
      return 'تجاوز الامتحان الحالي (نشط الآن)';
    }

    const secs = Math.floor(diff / 1000) % 60;
    const mins = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    let arString = '';
    if (days > 0) arString += `${days} يوم، `;
    if (hours > 0) arString += `${hours} ساعة، `;
    arString += `${mins} دقيقة، و ${secs} ثانية`;
    return arString;
  };

  return (
    <div id="notifications_tracker_wrapper" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans text-right">
      
      {/* Real-time system notifications popup bar */}
      {activeNotification && (
        <div id="countdown_toast_alert" className="col-span-12 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 border border-amber-500 text-white p-4.5 rounded-2xl flex items-center justify-between gap-4 shadow-xl text-right animate-pulse">
          <button
            type="button"
            onClick={() => setActiveNotification(null)}
            className="text-white bg-black/20 hover:bg-black/40 py-1.5 px-3.5 rounded-lg text-xs font-semibold cursor-pointer"
          >
            حسناً، بدأت الامتحان
          </button>
          <div className="flex items-center gap-3 justify-end">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold leading-none">تنبيه ذكي: موعد الامتحان قارب على البدء!</h4>
              <p className="text-xs text-slate-100">{activeNotification} - يرجى الاستعداد والتوجه إلى لجنتك فوراً.</p>
            </div>
            <div className="p-2 bg-white/20 text-white rounded-full">
              <Volume2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Alarms Creation Form Column */}
      <div id="tracker_form_col" className="lg:col-span-12 xl:col-span-5 space-y-6">
        
        <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 space-y-5 shadow-md">
          <div className="flex items-center gap-2.5 justify-end mb-1">
            <h3 className="font-bold text-white text-md">برمجة تنبيه ذكي جديد</h3>
            <div className="w-8 h-8 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Plus className="h-4.5 w-4.5" />
            </div>
          </div>

          <form onSubmit={handleAddAlert} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">مناسبة التنبيه أو عنوان التقديم</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: مراجعة نهائية، تسليم شيت"
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">المادة الدراسية المعنية</label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="مثال: تصميم معماري، القانون المدني"
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">تاريخ الامتحان</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 text-right font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">رسم الساعة بالدقائق</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 text-right font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">شعار التصنيف</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-blue-500 text-right cursor-pointer font-sans"
              >
                <option value="exam">امتحان رسمي بالكلية (اللجنة)</option>
                <option value="quiz">اختبار تجريبي ومنزلي</option>
                <option value="submission">موعد تسليم تقارير وملخصات</option>
              </select>
            </div>

            <button
              id="add_alert_btn"
              type="submit"
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 font-sans"
            >
              <Bell className="h-4 w-4" />
              <span>إدراج التنبيه وتفعيل التتبع</span>
            </button>
          </form>
        </div>

      </div>

      {/* Alarms Display List Column */}
      <div id="tracker_list_col" className="lg:col-span-12 xl:col-span-7 space-y-6">
        
        <div className="bg-[#14141A] p-6 rounded-3xl border border-slate-800 space-y-5 text-right shadow-md">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-[10px] font-mono bg-[#0D0D10] border border-slate-800 text-slate-450 py-1.5 px-3 rounded-xl font-bold">
              مجموع التنبيهات: {alerts.length}
            </span>
            <div className="flex items-center gap-2.5 justify-end">
              <h3 className="font-bold text-white text-base">جدول ومواعيد الامتحانات القريبة</h3>
              <div className="w-8 h-8 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-4 font-sans">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="bg-[#0D0D10] p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-end md:items-center justify-between gap-4 text-right transform hover:scale-[1.005] transition duration-300"
                >
                  
                  {/* Action or delete */}
                  <div className="flex items-center gap-2 order-2 md:order-1 w-full md:w-auto justify-end md:justify-start">
                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="bg-[#14141A] hover:bg-red-500/10 text-slate-400 hover:text-red-400 p-2.5 rounded-xl border border-slate-805 hover:border-red-500/30 transition cursor-pointer"
                      title="حذف هذا الجدول"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Core Alarm body info */}
                  <div className="space-y-2.5 order-1 md:order-2 text-right w-full md:w-auto">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-bold text-sm text-white">{alert.title}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                        alert.type === 'exam' ? 'bg-red-900/20 text-red-300 border border-red-800/30' :
                        alert.type === 'quiz' ? 'bg-blue-900/20 text-blue-300 border border-blue-800/30' :
                        'bg-emerald-900/20 text-emerald-300 border border-emerald-800/30'
                      }`}>
                        {alert.type === 'exam' && 'لجنة رئيسية'}
                        {alert.type === 'quiz' && 'اختبار تدريبي'}
                        {alert.type === 'submission' && 'تسليم تقرير'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 px-1 text-slate-400 font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <span>{new Date(alert.dateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{new Date(alert.dateTime).toLocaleDateString('ar-EG')}</span>
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="text-[10px] text-slate-300 font-semibold font-sans bg-[#14141A] px-2 py-0.5 rounded-md border border-slate-805">
                        {alert.subject}
                      </div>
                    </div>

                    {/* Highly advanced Live ticking countdown tracker */}
                    <div className="bg-[#09090D] p-3 rounded-xl border border-slate-850 flex items-center justify-end gap-2 text-[10px]">
                      <span className="text-emerald-400 font-extrabold leading-none font-sans">
                        {getCountdownString(alert.dateTime)}
                      </span>
                      <span className="text-slate-500 font-sans">متبقي على الانطلاق:</span>
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    </div>

                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-3xl bg-[#0d0d10]/20 font-sans">
              لا توجد أي امتحانات قادمة مجدولة في كليتك لغاية الآن.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
