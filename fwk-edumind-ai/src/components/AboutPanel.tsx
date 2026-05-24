import React from 'react';
import { User, ShieldCheck, Info, FileCode, CheckCircle, Database, HelpCircle, FileCheck2 } from 'lucide-react';

export default function AboutPanel() {
  return (
    <div id="about_panel_wrapper" className="space-y-6 text-right">
      
      {/* Welcome & Developer Resume Card */}
      <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="text-center md:text-right space-y-2 order-2 md:order-1">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center justify-center md:justify-end gap-2">
              <span className="text-blue-400 font-mono text-[11px] bg-blue-500/10 px-3 py-0.5 rounded-full border border-blue-500/20">BIO</span>
              <span>مطور ومؤسس المنصة</span>
            </h2>
            <h3 className="text-md font-bold text-blue-400">المهندس ومستشار البرنامج الأكاديمي للبرمجة</h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              تم تصميم وتطوير هذا النظام الأكاديمي الذكي بالكامل كحل ريادي متميز لدعم طلاب ومحاضري الجامعات العربية والعالمية. يهدف التطبيق لتبسيط عملية التلخيص الفوري للمحاضرات المعقدة وصياغة اختبارات مخصصة لضمان دقة الاستيعاب وتهيئة الطلاب للامتحانات.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shrink-0 order-1 md:order-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Requirements & Parameters guide */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prerequisite and requirements requested from student / lecturer */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs text-blue-400 font-bold">الملفات والمستندات المطلوبة للتشغيل الفعال</span>
              <FileCheck2 className="h-4 w-4 text-blue-400" />
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              للاستفادة القصوى من خوارزميات الذكاء الاصطناعي وبدء تجهيز الملخصات والاختبارات، يرجى تقديم المدخلات المناسبة للمحاضرة حسب كليتك ومقررك الدراسي. إليك تفاصيل ما نحتاجه منك:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-[#14141A] border border-slate-850 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-200">1. اسم المحاضرة والمادة العلمية</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يجب إدخال اسم موضوع المحاضرة بدقة (مثل: هياكل البيانات أو المحاسبة المالية)، واختيار الكلية المعنية لتكييف الشروحات الأكاديمية وصياغة المعارف المتوافقة.
                </p>
              </div>

              <div className="p-4 bg-[#14141A] border border-slate-850 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-200">2. النصوص المباشرة أو الملفات</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يمكنك رفع ملفات <span className="text-blue-400 font-bold">PDF</span> من أوراق الشرح، أو رفع صور لمقتطفات السبورة والكتب، أو لصق نصوص المحاضرة كتابةً في محرر النصوص.
                </p>
              </div>

              <div className="p-4 bg-[#14141A] border border-slate-850 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-200">3. تسجيلات الصوت والفيديوهات</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يمكنك استخدام ميزة تسجيل الصوت المباشر من الميكروفون لالتقاط شرح المحاضر فوريًا، وتصدير الملف الصوتي ليتولى المعالج تحليله بدقة.
                </p>
              </div>

              <div className="p-4 bg-[#14141A] border border-slate-850 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-200">4. تحديد اللغة المستهدفة</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  تحديد لغة المخرجات (العربية، الإنجليزية، الفرنسية، الألمانية) لضمان أن تتم صياغة جميع المفاهيم والتعليلات والاختبارات في صلب وتفاصيل لغة دراستك.
                </p>
              </div>
            </div>
          </div>

          {/* System Technical Specifications */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs text-blue-400 font-bold">مواصفات وتقنيات الذكاء الاصطناعي بالمنصة</span>
              <Database className="h-4 w-4 text-blue-400" />
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex items-start justify-end gap-3 text-right">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">معالج الاستيعاب اللغوي (NLP):</strong> يستند النظام للجيل الأحدث من عائلة معالجات <span className="text-blue-400 font-mono font-bold">Gemini 3.5 Flash</span> التي تتميز بنافذة سياق ضخمة جداً، مما يمنحه القدرة على قراءة المحتوى بدقة علمية وفصل الأكواد الرياضية والبرمجية.
                </p>
              </div>

              <div className="flex items-start justify-end gap-3 text-right">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">خوارزمية الأسئلة والتقييم المتكامل:</strong> يتم صياغة أربعة أنماط معتمدة من الأسئلة الأكاديمية (اختياري، صح وخطأ، أكمل، مقالي) لضمان تغطية جزيئيات الفهم المعرفي السطحي للطلاب وحتى التحليلات العميقة للمواد العلمية والهندسية والطبية.
                </p>
              </div>

              <div className="flex items-start justify-end gap-3 text-right">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">التصدير القياسي المفتوح:</strong> يتكامل النظام مع المكتبات الأكاديمية العالمية لتوليد وتوطيد ملفات Word القياسية (.docx) بصياغات وتصميمات رسمية تسهل طباعتها وتداولها بين أعضاء هيئة التدريس والطلاب.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Copyrights & Trust certification */}
        <div className="space-y-6">
          
          {/* Copyrights and Property ownership Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#121217] border border-slate-800 rounded-xl p-6 space-y-4 text-right">
            
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs text-blue-400 font-bold">حقوق الملكية والحماية والقانون</span>
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              جميع الحقوق البرمجية والعلمية وإدارة قواعد البيانات للامتحانات وتصميم واجهات المنصة مرخصة قانونياً للجهة المالكة والمشروعة.
            </p>

            <div className="p-4 bg-[#0a0a0c] border border-slate-850 rounded-xl space-y-2">
              <div className="text-xs text-white font-bold">بيان الملكية القانونية:</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                أي محاولة لاستنساخ الشفرة البرمجية للنظام أو الاستيلاء على الخوادم والملخصات الأكاديمية دون تفويض كتابي رسمي ستخضع مباشرة للمساءلة والتعويضات المدنية والجزائية بموجب قوانين حماية المصنفات وحقوق المؤلف الرقمية السائدة.
              </p>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-end gap-2">
              <span>مرخص للمؤسسات التعليمية والباحثين</span>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            </div>

            <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-850 text-center font-mono">
              Copyright © 2026 Academic AI Pro Systems. All Rights Reserved.
            </div>

          </div>

          {/* Quick FAQ Card */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-3 text-right">
            <h4 className="text-xs font-bold text-white flex items-center justify-end gap-2">
              <span>أي أسئلة إضافية؟</span>
              <HelpCircle className="h-4 w-4 text-blue-400" />
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              تفضل بزيارة مركز المساعدة أو قراءة الشروط والخصوصية المتاحة في علامة التبويب المجاورة لإرسال استفسارك أو ملاحظاتك التعديلية للمهندسين فوراً.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
