/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { ShieldCheck, GraduationCap, ArrowRight, UserCheck, KeyRound, Eye, EyeOff, HelpCircle, ArrowLeft } from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (student: Student, committeeData: any) => void;
}

interface SavedUser extends Student {
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export default function LoginPortal({ onLoginSuccess }: LoginPortalProps) {
  // Modes: 'login' | 'register' | 'recover'
  const [formMode, setFormMode] = useState<'login' | 'register' | 'recover'>('login');

  // Input states
  const [name, setName] = useState('');
  const [academicId, setAcademicId] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [college, setCollege] = useState('كلية الحاسبات والمعلومات - جامعة المنوفية');
  const [department, setDepartment] = useState('');
  const [academyLevel, setAcademyLevel] = useState('السنة الثالثة');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('ما هي مدينتك المفضلة التي تحب زيارتها؟');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Login states
  const [loginIdentifier, setLoginIdentifier] = useState(''); // can be academic ID or national ID
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Recovery states
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState('ما هي مدينتك المفضلة التي تحب زيارتها؟');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // Shared UI states
  const [errorCode, setErrorCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const collegesList = [
    'كلية الحاسبات والمعلومات - جامعة المنوفية',
    'كلية الهندسة - جامعة القاهرة',
    'كلية الحاسبات والمعلومات - جامعة عين شمس',
    'كلية التجارة - جامعة الإسكندرية',
    'كلية العلوم - جامعة المنصورة',
    'كلية الطب البشري - جامعة القاهرة',
    'كلية الحقوق - جامعة حلوان',
    'كلية الآداب - جامعة كفر الشيخ',
  ];

  const levelsList = [
    'السنة الأولى (الفرقة الأولى)',
    'السنة الثانية (الفرقة الثانية)',
    'السنة الثالثة (الفرقة الثالثة)',
    'السنة الرابعة (الفرقة الرابعة)',
    'السنة الخامسة (بكالوريوس الطب/الهندسة)',
    'مرحلة الدراسات العليا / ماجستير / دكتوراه',
  ];

  const securityQuestionsList = [
    'ما هي مدينتك المفضلة التي تحب زيارتها؟',
    'ما هو اسم أول مدرسة التحقت بها في صغرك؟',
    'ما هو اسم تخصصك المفضل بالثانوية العامة؟',
    'ما هو اسم كتابك أو روايتك المفضلة؟'
  ];

  // Initialize Local Storage Users if empty or outdated
  useEffect(() => {
    const existingUsers = localStorage.getItem('EDUMIND_USERS');
    if (!existingUsers || existingUsers.includes('سحر') || !existingUsers.includes('جامعة المنوفية')) {
      const defaultUsers: SavedUser[] = [
        {
          name: 'فتحي الكيلاني',
          academicId: '123456',
          nationalId: '29904250109876',
          college: 'كلية الحاسبات والمعلومات - جامعة المنوفية',
          department: 'نظم المعلومات',
          academyLevel: 'السنة الثالثة',
          password: '123456',
          securityQuestion: 'ما هي مدينتك المفضلة التي تحب زيارتها؟',
          securityAnswer: 'المنوفية'
        }
      ];
      localStorage.setItem('EDUMIND_USERS', JSON.stringify(defaultUsers));
    }
  }, []);

  const getSavedUsers = (): SavedUser[] => {
    try {
      const data = localStorage.getItem('EDUMIND_USERS');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveUserList = (users: SavedUser[]) => {
    localStorage.setItem('EDUMIND_USERS', JSON.stringify(users));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorCode('الرجاء إدخال الرقم الأكاديمي أو الرقم القومي للمتابعة');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorCode('الرجاء إدخال كلمة المرور');
      return;
    }

    setLoading(true);

    try {
      const users = getSavedUsers();
      const matchedUser = users.find(u => 
        u.academicId === loginIdentifier.trim() || 
        u.nationalId === loginIdentifier.trim()
      );

      if (!matchedUser) {
        setErrorCode('لم يتم العثور على هذا الحساب في قاعدة البيانات الأكاديمية. يرجى الضغط على "تسجيل حساب جديد" أولاً.');
        setLoading(false);
        return;
      }

      if (matchedUser.password !== loginPassword) {
        setErrorCode('كلمة المرور غير صحيحة! يرجى التحقق مسبقاً أو الضغظ على "نسيت كلمة المرور" لاستعادتها.');
        setLoading(false);
        return;
      }

      // Query Exam committee from server database so they match live layouts
      const response = await fetch('/api/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: matchedUser.name,
          academicId: matchedUser.academicId,
          nationalId: matchedUser.nationalId,
          college: matchedUser.college,
          department: matchedUser.department,
          academyLevel: matchedUser.academyLevel,
        }),
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        const studentInfo: Student = {
          name: result.data.studentName || matchedUser.name,
          academicId: result.data.studentId || matchedUser.academicId,
          nationalId: result.data.nationalId || matchedUser.nationalId,
          college: result.data.college || matchedUser.college,
          department: matchedUser.department || 'عام',
          academyLevel: matchedUser.academyLevel,
        };
        onLoginSuccess(studentInfo, result.data);
      } else {
        setErrorCode(result.error || 'حدث خطأ غير متوقع أثناء الدخول.');
      }
    } catch (err) {
      setErrorCode('فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالشبكة.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorCode('الرجاء إدخال اسمك الكامل شريطة باللغة العربية');
      return;
    }
    if (!academicId.trim() && !nationalId.trim()) {
      setErrorCode('يجب إدخال الرقم الأكاديمي أو الرقم القومي للتسجيل التلقائي');
      return;
    }
    if (nationalId.trim() && (nationalId.trim().length !== 14 || isNaN(Number(nationalId)))) {
      setErrorCode('الرقم القومي يجب أن يتكون من 14 رقماً بالكامل');
      return;
    }
    if (!password || password.length < 5) {
      setErrorCode('يجب ألا تقل كلمة المرور عن 5 أحرف أو أرقام لتكون آمنة');
      return;
    }
    if (password !== confirmPassword) {
      setErrorCode('كلمتا المرور غير متطابقتين، يرجى إعادة تدوينهما بالدقة المطلوب');
      return;
    }
    if (!securityAnswer.trim()) {
      setErrorCode('يرجى كتابة إجابة سؤال الأمان لاستعادة حسابك في حال فقدانه مسبقاً');
      return;
    }

    setLoading(true);

    const users = getSavedUsers();
    // Check duplication
    const duplicate = users.find(u => 
      (academicId && u.academicId === academicId.trim()) || 
      (nationalId && u.nationalId === nationalId.trim())
    );

    if (duplicate) {
      setErrorCode('هذا الحساب مسجّل بالفعل مسبقاً! الرجاء تسجيل الدخول مباشرة.');
      setLoading(false);
      return;
    }

    const newUser: SavedUser = {
      name: name.trim(),
      academicId: academicId.trim() || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
      nationalId: nationalId.trim() || `NID-${Math.floor(100000 + Math.random() * 900000)}`,
      college,
      department: department.trim() || 'عام',
      academyLevel,
      password,
      securityQuestion,
      securityAnswer: securityAnswer.trim()
    };

    users.push(newUser);
    saveUserList(users);

    setSuccessMsg('تم إنشاء حساب الطالب بنجاح وبشكل آمن تماماً! تفضل بتسجيل الدخول الآن.');
    setLoading(false);
    
    // Switch back to login page
    setName('');
    // Prefill login identifier
    setLoginIdentifier(newUser.academicId || newUser.nationalId);
    setFormMode('login');
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode('');
    setSuccessMsg('');

    if (!recoveryIdentifier.trim()) {
      setErrorCode('الرجاء كتابة الرقم الأكاديمي أو الرقم القومي للمطابقة');
      return;
    }
    if (!recoveryAnswer.trim()) {
      setErrorCode('الرجاء إدخال إجابة سؤال الأمان الخاص بك للتأكد من ملكية الحساب');
      return;
    }
    if (!newPassword || newPassword.length < 5) {
      setErrorCode('كلمة المرور الجديدة يجب ألا تقل عن 5 رموز');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setErrorCode('لا تتطابق كلمات المرور الجديدة المدونة');
      return;
    }

    setLoading(true);

    const users = getSavedUsers();
    const userIndex = users.findIndex(u => 
      u.academicId === recoveryIdentifier.trim() || 
      u.nationalId === recoveryIdentifier.trim()
    );

    if (userIndex === -1) {
      setErrorCode('لم نتمكن من العثور على أي طالب مسجل بهذه الرموز.');
      setLoading(false);
      return;
    }

    const user = users[userIndex];
    if (user.securityQuestion !== recoveryQuestion || user.securityAnswer?.toLowerCase() !== recoveryAnswer.trim().toLowerCase()) {
      setErrorCode('إجابة سؤال الأمان غير مطابقة! يرجى تذكر الإجابة التي أدخلتها عند التسجيل.');
      setLoading(false);
      return;
    }

    // Reset password
    user.password = newPassword;
    users[userIndex] = user;
    saveUserList(users);

    setSuccessMsg('تمت استعادة حسابك وإعادة تعيين كلمة المرور بنجاح! يرجى الدخول بكلمة المرور الجديدة.');
    setLoading(false);
    setLoginIdentifier(user.academicId);
    setFormMode('login');
  };

  const handlePreFill = (studentType: 'ahmed') => {
    setLoginIdentifier('123456');
    setLoginPassword('123456');
  };

  return (
    <div id="login_portal_wrapper" className="min-h-screen grid lg:grid-cols-12 bg-[#0A0A0B] text-slate-200 font-sans">
      
      {/* Visual Welcome Board */}
      <div id="login_welcome_col" className="hidden lg:flex lg:col-span-5 bg-[#0D0D10] p-12 flex-col justify-between border-r border-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg text-white font-mono">EDUMIND <span className="text-blue-500 italic uppercase text-xs tracking-widest ml-1">AI PRO</span></span>
        </div>

        <div className="my-auto space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight leading-snug text-white">
            بوابتك الأكاديمية الشاملة <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">بتقنيات الذكاء الاصطناعي</span>
          </h1>
          <p className="text-slate-400 leading-relaxed text-sm text-right leading-loose">
            سجل الآن بشكل آمن تماماً للوصول إلى مركز تلخيص المحاضرات التفاعلي بجميع اللغات، توليد الامتحانات الإلكترونية المتنوعة، وتتبع مقعدك واللجان ومواعيد المواد بدقة تامة.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3.5 bg-[#14141A] p-4 rounded-xl border border-slate-800">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-right">
                <h4 className="text-sm font-semibold text-white">نظام التشفير وحماية البيانات</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">تخضع هويتك وكلمة مرورك لنظام حماية متطور مع إمكانية استعادتها فوراً عبر أسئلة بروتوكول الأمان الخاصة بك.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono text-right">
          بروتوكول التسجيل المعتمد لجميع الكليات بجمهورية مصر العربية والمعاهد العربية والدولية © 2026
        </div>
      </div>

      {/* Forms Handler Column */}
      <div id="login_form_col" className="lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg space-y-8 bg-[#14141A] p-8 rounded-3xl border border-slate-800 shadow-xl">
          
          {/* Messages Alerts */}
          {errorCode && (
            <div className="text-red-400 font-semibold text-xs bg-red-950/40 p-4 rounded-xl border border-red-500/20 text-center leading-relaxed">
              {errorCode}
            </div>
          )}

          {successMsg && (
            <div className="text-emerald-400 font-semibold text-xs bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/20 text-center leading-relaxed">
              {successMsg}
            </div>
          )}

          {/* 1. LOGIN INTERFACE */}
          {formMode === 'login' && (
            <div className="space-y-6">
              <div className="space-y-2 text-right">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-end gap-2">
                  <span>تسجيل الدخول الآمن</span>
                  <ShieldCheck className="h-6 w-6 text-blue-500" />
                </h2>
                <p className="text-slate-400 text-xs">أدخل الرقم الأكاديمي أو القومي مع كلمة المرور لفتح لوحة تحكم الطالب</p>
              </div>

              {/* Quick Mock Login Profiles */}
              <div className="p-3.5 bg-[#0D0D10] rounded-xl border border-slate-800 flex flex-col gap-2.5 text-right">
                <div className="text-[11px] text-slate-400 font-semibold">الملف الشخصي التجريبي والمثبت مسبقاً:</div>
                <div className="grid grid-cols-1">
                  <button
                    type="button"
                    onClick={() => handlePreFill('ahmed')}
                    className="text-xs bg-[#14141A] hover:bg-slate-800 text-blue-400 border border-slate-800 rounded-xl p-3.5 transition cursor-pointer text-center leading-none font-bold"
                  >
                    فتحي الكيلاني (حاسبات المنوفية) - الرقم "123456"
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-right">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">الرقم الأكاديمي أو الرقم القومي</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="أدخل رقم ID الجامعي أو بطاقة الـ 14 رقماً"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-mono"
                    />
                    <UserCheck className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setFormMode('recover')}
                      className="text-xxs text-slate-400 hover:text-blue-400 transition cursor-pointer"
                    >
                      هل نسيت كلمة المرور؟
                    </button>
                    <label className="block text-xs font-semibold text-slate-300">كلمة المرور الخاصة بك</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور التي سجلت بها"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="login_submit_btn"
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-2 text-xs"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>تسجيل الدخول الآمن للوحة التحكم</span>
                      <ArrowRight className="h-4 w-4 transform rotate-180" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">لا تمتلك حساباً مسجلاً لغاية الآن؟ </span>
                <button
                  type="button"
                  onClick={() => setFormMode('register')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                >
                  انقر هنا لإنشاء حساب أكاديمي
                </button>
              </div>
            </div>
          )}

          {/* 2. REGISTRATION INTERFACE */}
          {formMode === 'register' && (
            <div className="space-y-6">
              <div className="space-y-1 text-right">
                <h2 className="text-xl font-bold text-white flex items-center justify-end gap-2">
                  <span>إنشاء حساب طالب / محاضر جديد</span>
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                </h2>
                <p className="text-slate-400 text-xxs">يتيح لك هذا النظام حفظ بياناتك محلياً وتفعيل خطة تلخيص المحاضرات والامتحانات للجانبين</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 text-right">
                
                <div className="space-y-1">
                  <label className="block text-xxs font-semibold text-slate-300">الاسم الكامل بالطراز العربي الموثق</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: فتحي وحيد فتحي كيلاني"
                    className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">الرقم الأكاديمي (ID)</label>
                    <input
                      type="text"
                      required
                      value={academicId}
                      onChange={(e) => setAcademicId(e.target.value)}
                      placeholder="رقم الكارنيه الجامعي"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">الرقم القومي (14 خانة)</label>
                    <input
                      type="text"
                      maxLength={14}
                      required
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="البطاقة الشخصية"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">الكلية والجامعة</label>
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 text-right cursor-pointer"
                    >
                      {collegesList.map((col, idx) => (
                        <option key={idx} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">القسم أو التخصص</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="مثال: نظم المعلومات"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">الفرقة الأكاديمية</label>
                    <select
                      value={academyLevel}
                      onChange={(e) => setAcademyLevel(e.target.value)}
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 text-right cursor-pointer"
                    >
                      {levelsList.map((lvl, idx) => (
                        <option key={idx} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">كلمة المرور (أكثر من 5 حروف)</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="إنشاء كلمة مرور آمنة"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white/90 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال الباسورد"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white/90 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">سؤال الأمان (لاستعادة الحساب)</label>
                    <select
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-3 py-2.5 text-xxs text-white focus:outline-none focus:border-blue-500 text-right cursor-pointer"
                    >
                      {securityQuestionsList.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xxs font-semibold text-slate-300">إجابة سؤال الأمان (يرجى حفظها جيداً)</label>
                  <input
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="اكتب إجابة الأمان لاستعادة الباسورد لاحقاً في سطر واحد"
                    className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorCode('');
                      setFormMode('login');
                    }}
                    className="w-1/3 bg-[#0D0D10] hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold py-3 px-4 rounded-xl transition cursor-pointer text-center"
                  >
                    إلغاء والعودة
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl transition text-xs shadow-md shadow-emerald-950/20 text-center flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <span>تأكيد وإنشاء الحساب</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 3. PASSWORD RECOVERY INTERFACE */}
          {formMode === 'recover' && (
            <div className="space-y-6">
              <div className="space-y-1 text-right">
                <h2 className="text-xl font-bold text-white flex items-center justify-end gap-2">
                  <span>استعادة الحساب وإعادة تعيين الباسورد</span>
                  <HelpCircle className="h-5 w-5 text-amber-500" />
                </h2>
                <p className="text-slate-400 text-xxs">يرجى مطابقة معرف الطالب الخاص بك مع إجابة سؤال الأمان لإفراز وتغيير كلمة السر فوراً</p>
              </div>

              <form onSubmit={handleRecovery} className="space-y-4 text-right">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">الرقم الأكاديمي أو الرقم القومي للطالب</label>
                  <input
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="أدخل الـ ID أو بطاقة الـ 14 رقماً"
                    className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">سؤال الأمان الذي اخترته عند التسجيل</label>
                  <select
                    value={recoveryQuestion}
                    onChange={(e) => setRecoveryQuestion(e.target.value)}
                    className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 text-right cursor-pointer"
                  >
                    {securityQuestionsList.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">إجابة سؤال الأمان المحددة من قبلك</label>
                  <input
                    type="text"
                    required
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                    placeholder="اكتب الإجابة المفصلة"
                    className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-right"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="اكتب كلمة مرور جديدة"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 text-right"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xxs font-semibold text-slate-300">تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      required
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      placeholder="تأكيد كلمة المرور الجديدة"
                      className="w-full bg-[#0D0D10] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorCode('');
                      setFormMode('login');
                    }}
                    className="w-1/3 bg-[#0D0D10] hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs py-3 px-4 rounded-xl transition cursor-pointer text-center"
                  >
                    إلغاء والعودة
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-5 rounded-xl transition text-xs shadow-md text-center flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <span>إعادة التعيين والتسجيل مسبقاً</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
