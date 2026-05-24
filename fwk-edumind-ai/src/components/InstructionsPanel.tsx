import React, { useState } from 'react';
import { BookOpen, AlertCircle, Compass, Shield, Users, Clock, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface CollegeGuide {
  id: string;
  name: string;
  ename: string;
  color: string;
  icon: any;
  generalRules: string[];
  disciplinaryAction: string[];
  essentialTools: string[];
  contactEmail: string;
}

const COLLEGES_DATA: CollegeGuide[] = [
  {
    id: 'engineering',
    name: 'كلية الهندسة',
    ename: 'Faculty of Engineering',
    color: 'from-blue-600 to-cyan-500',
    icon: Compass,
    generalRules: [
      'احرص على التواجد في ورش العمل واللجان قبل موعد الامتحان بـ 30 دقيقة على الأقل لالستفادة من وقت توزيع الكراسات.',
      'يمنع تماماً استخدام أي هاتف ذكي أو ساعة متصلة بالإنترنت داخل اللجان الهندسية.',
      'تجهيز ورقة القوانين والـ Formula Sheets المعتمدة من أستاذ المادة والحرص على عدم الكتابة عليها.',
      'الالتزام بقواعد السلامة المهنية داخل معامل الهندسة الكيميائية والقوى والورش الجامعية.'
    ],
    disciplinaryAction: [
      'فقدان درجات أعمال السنة في حال الغياب غير المبرر عن الورش العملية بنسبة تزيد عن 15%.',
      'الحرمان من تسليم مشروع التخرج في حال ضبط أي محاولة اقتباس أو غش علمي (Plagiarism) دون توثيق واضح.'
    ],
    essentialTools: [
      'آلة حاسبة علمية غير قابلة للبرمجة (مثل Casio fx-991ARX)',
      'أقلام رسم هندسي، فرجار، ومسطرة حرف T بطول مناسب',
      'لوحة بيضاء وبطاقة الهوية الأكاديمية (الكرنيه)'
    ],
    contactEmail: 'engineering.support@univ.edu.eg'
  },
  {
    id: 'computers',
    name: 'كلية الحاسبات والمعلومات',
    ename: 'Faculty of Computers & Information',
    color: 'from-purple-600 to-indigo-500',
    icon: Shield,
    generalRules: [
      'إجراء الفحص التجريبي لنظم التشغيل وبيئة التطوير قبل بدء الاختبار بـ 15 دقيقة والتأكد من استقرار الإنترنت الخاص بالقاعة.',
      'ممنوع مشاركة أي شفرة برمجية (Code snippets) أو استخدام وحدات التخزين الخارجية (USB) داخل المعامل.',
      'الالتزام بالـ Repository والروابط الرسمية المحددة لرفع الكود النهائي.',
      'يمنع تماماً استخدام منصات الذكاء الاصطناعي الخارجية أثناء الامتحانات العملية إلا في حال التصريح بذلك بشكل رسمي.'
    ],
    disciplinaryAction: [
      'يعتبر الكود منسوخاً وتطبق عقوبة الغش على كلا الطرفين في حال تطابق الشفرة البرمجية بنسبة تتجاوز الحدود المسموحة.',
      'الإبعاد المؤقت عن الشبكة الأكاديمية في حال محاولة الوصول المباشر إلى خوادم الكلية دون تصريح مسبق.'
    ],
    essentialTools: [
      'لابتوب في الامتحانات المدعومة بالإحضار الذاتي (BYOD) مع تثبيت البرامج اللازمة المتفقة مع المنهج الدراسي',
      'حساب جيت هاب جامعي فعال ومرتبط بالبريد الإلكتروني للكلية',
      'مفتاح المرور الإلكتروني الثنائي (2FA) المعتمد في البوابة الموحدة'
    ],
    contactEmail: 'fci.tech@univ.edu.eg'
  },
  {
    id: 'medicine',
    name: 'كلية الطب البشري',
    ename: 'Faculty of Medicine',
    color: 'from-rose-600 to-pink-500',
    icon: Users,
    generalRules: [
      'الالتزام بارتداء البالطو الأبيض بالكامل والمظهر المهني اللائق داخل المستشفيات التعليمية والمعامل الميدانية.',
      'ممنوع تصوير المرضى أو نشر أي بيانات متعلقة بالملفات الطبية للحالات السريرية احتراماً لخصوصيتهم المطلقة.',
      'تطهير الأدوات الطبية والشخصية واستخدام الكمامات الطبية طوال التواجد في قاعات الشرح والعمليات.',
      'اتباع توجيهات الأطباء والمشرفين الاستشاريين في اللجان الشفهية (OSCE).'
    ],
    disciplinaryAction: [
      'الحرمان الفوري من دخول امتحانات التقييم السريري في حال المساس بخصوصية المرضى أو إساءة المعاملة الإكلينيكية.',
      'تأجيل الفصل الدراسي وتكرار دورة التدريب كاملة عند الإخلال بقواعد الأمان الحيوي ومراقبة العدوى.'
    ],
    essentialTools: [
      'سماعة طبيب عالية الجودة، ومطرقة الأعصاب، وجهاز قياس تمدد الحدقة الطبي',
      'البطاقة البحثية السريرية المعقمة والبالطو المهني اللائق',
      'كراسة متابعة الحالات (Logbook) الموقعة من رئيس القسم'
    ],
    contactEmail: 'medicine.dean@univ.edu.eg'
  },
  {
    id: 'pharmacy',
    name: 'كلية الصيدلة',
    ename: 'Faculty of Pharmacy',
    color: 'from-emerald-600 to-teal-500',
    icon: Flame,
    generalRules: [
      'الالتزام بقواعد السلامة الكيميائية التامة داخل المعامل وتجنب استنشاق المركبات أو خلط المواد دون توجيه صريح.',
      'يمنع إخراج أي عينات صيدلانية أو عقاقير أو تركيبات خام خارج النطاق الفني المسموح للمقرر بالمعامل.',
      'تسجيل نسب القياسات وتدوين الملاحظات المعملية بدقة متناهية تحت طائلة الخصم الأكاديمي.',
      'الاطلاع الدقيق على ورقة الأخطار الكيميائية قبل تفعيل واختبار التجارب الحيوية.'
    ],
    disciplinaryAction: [
      'منع الطالب من التواجد بالمعمل بقية مادة الكلية في حال كسر البروتوكولات الأمنية للأمان الكيميائي والبيئي.',
      'حرمان الطالب من درجات التجربة البحثية عند استخدام مواد من مصادر غير معتمدة أو تزوير قيم التركيب الكيميائي.'
    ],
    essentialTools: [
      'نظارات الأمان البصرية البلاستيكية ضد الرذاذ الكيميائي',
      'القفازات الطبية المقاومة للمحاليل المركزة والبالطو الطبي',
      'كراسة التقارير المعملية والقلم الجاف لتثبيت النتائج المباشرة'
    ],
    contactEmail: 'pharmacy.office@univ.edu.eg'
  },
  {
    id: 'commerce',
    name: 'كلية التجارة وإدارة الأعمال',
    ename: 'Faculty of Commerce',
    color: 'from-amber-600 to-orange-500',
    icon: Clock,
    generalRules: [
      'الحرص على مراجعة نظريات المحاسبة، وجداول الإحصاء المرفقة مع ورقة الأسئلة بجميع لغاتها المعتمدة.',
      'يمنع استخدام أي نماذج محاسبية أو برمجيات حساب ثانوية تخرج عن إطار الحاسبات البسيطة الساذجة.',
      'الالتزام التام بالمنهجيات المالية الحديثة وصياغة التحليلات الاقتصادية في نماذج وافية.',
      'الإشراف والتعاون المثمر في مشاريع ريادة الأعمال ودراسات الجدوى التطبيقية.'
    ],
    disciplinaryAction: [
      'إلغاء امتحان أعمال السنة في حال وجود قصاصات غير مرخصة تتضمن جداول توازن مالي أو ميزانيات جاهزة.',
      'الحرمان الكلي من المقرر عند ثبوت توكيل محرر خارجي لعمل دراسات الجدوى والتقارير المالية للطلاب.'
    ],
    essentialTools: [
      'آلة حاسبة حسابية قياسية غير مبرمجة لجدولة الحسابات',
      'مساطر التنظيم الفني لرسم الميزانيات وتوازنات العرض والطلب',
      'مستندات كشوف الامتحانات الجامعية والهوية الأكاديمية'
    ],
    contactEmail: 'commerce.support@univ.edu.eg'
  }
];

export default function InstructionsPanel() {
  const [selectedCollege, setSelectedCollege] = useState<string>('engineering');

  const activeCollege = COLLEGES_DATA.find(c => c.id === selectedCollege) || COLLEGES_DATA[0];
  const IconComponent = activeCollege.icon;

  return (
    <div id="instructions_panel_wrapper" className="space-y-6 text-right">
      <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="text-center md:text-right space-y-2 order-2 md:order-1">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center justify-center md:justify-end gap-2">
              <span className="text-blue-400 font-mono text-[11px] bg-blue-500/10 px-3 py-0.5 rounded-full border border-blue-500/20">GUIDES</span>
              <span>مركز التعليمات الأكاديمية وإرشادات الكليات</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              اختر كليتك الخاصة لاستكشاف لائحة النظام الأكاديمي، شروط لجان الاختبار الأسبوعية والنهائية، الملحقات المسموحة، وتبعات السلوك الدراسي لضمان تجربة تعليمية سلسة وخالية من المتاعب.
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl shrink-0 order-1 md:order-2">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* College Picker Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {COLLEGES_DATA.map((col) => {
          const ColIcon = col.icon;
          const isSelected = col.id === selectedCollege;
          return (
            <button
              key={col.id}
              onClick={() => setSelectedCollege(col.id)}
              className={`p-4 rounded-xl border transition text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'bg-[#111114] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <ColIcon className={`h-5 w-5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
              <div className="text-xs font-bold leading-tight">{col.name}</div>
              <div className="text-[9px] text-slate-500 font-mono tracking-wide">{col.ename}</div>
            </button>
          );
        })}
      </div>

      {/* Guide Content Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Rules Column (2cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Rules */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs text-blue-400 font-bold">لائحة الضوابط العامة</span>
              <Compass className="h-4 w-4 text-blue-400" />
            </h3>
            <ul className="space-y-3.5">
              {activeCollege.generalRules.map((rule, idx) => (
                <li key={idx} className="flex items-start justify-end gap-3 text-right">
                  <span className="text-xs text-slate-300 leading-relaxed">{rule}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                </li>
              ))}
            </ul>
          </div>

          {/* Disciplinary actions */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-red-400 border-b border-slate-850 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs">المخالفات الإدارية والعقوبات</span>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </h3>
            <ul className="space-y-3.5">
              {activeCollege.disciplinaryAction.map((action, idx) => (
                <li key={idx} className="flex items-start justify-end gap-3 text-right bg-red-950/20 border border-red-900/10 p-3 rounded-lg">
                  <span className="text-xs text-slate-300 leading-relaxed">{action}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Sidebar Tools Column */}
        <div className="space-y-6">
          
          {/* Tools Component */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 border-b border-slate-850 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs">المستلزمات والأدوات المسموحة</span>
              <Shield className="h-4 w-4 text-emerald-400" />
            </h3>
            <div className="space-y-3">
              {activeCollege.essentialTools.map((tool, idx) => (
                <div key={idx} className="flex items-center justify-end gap-3 p-3 bg-[#14141A] rounded-lg border border-slate-850 text-right">
                  <span className="text-xs text-slate-200 font-medium">{tool}</span>
                  <div className="flex items-center justify-center w-5 h-5 bg-emerald-500/10 rounded font-mono text-[10px] text-emerald-400 font-bold shrink-0">{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Support and contact Info Cards */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 text-right">
            <h4 className="text-xs font-bold text-slate-400">التحدث لدعم اللجنة والكلية</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              إذا واجهتك أي مشكلة بخصوص قاعة الامتحان أو الأدوات أو أرقام الجلوس، يرجى التوجه لمكتب الأخصائي أو مراسلة بريد شؤون الطلاب الرسمي للكارد الفني:
            </p>
            <div className="p-3 bg-[#0c0c0d] border border-slate-850 rounded-lg text-center font-mono text-xs text-blue-400 font-bold select-all select-text selection:bg-blue-600/20">
              {activeCollege.contactEmail}
            </div>
            <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <span>يرجى كتابة الرقم الأكاديمي في عنوان الرسالة</span>
              <AlertCircle className="h-3 w-3 inline text-slate-500" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
