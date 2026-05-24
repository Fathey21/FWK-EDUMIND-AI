import React, { useState } from 'react';
import { 
  LifeBuoy, MessageSquare, Send, CheckCircle2, ShieldAlert, 
  ChevronDown, HelpCircle, Star, Sparkles, BookOpen 
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  category: string;
  rating: number;
  comments: string;
  timestamp: string;
  academicId: string;
}

const FAQS_DATA = [
  {
    question: "ما هي صيغ ومقاسات الملفات المسموح برفعها في تطبيق التلخيص؟",
    answer: "يدعم النظام حالياً ملفات PDF للأوراق والمذكرات الجامعية، وصور الملخصات أو مقتطفات الكتب (PNG, JPG, WebP)، بحد أقصى 10 ميجا بايت للملف لضمان سرعة المعالجة المباشرة بالذكاء الاصطناعي."
  },
  {
    question: "كيف يمكنني استخدام ميزة التسجيل الصوتي في المحاضرة؟",
    answer: "اضغط على زر 'بدء التسجيل الصوتي' في لوحة التلخيص لتشغيل ميكروفون جهازك فوريًا، وتحدث بوضوح أو وجه المحرك نحو المحاضر. بعد الانتهاء اضغط 'إيقاف التسجيل' لتوليد ومعالجة المخرجات الأكاديمية."
  },
  {
    question: "لماذا تظهر لي إجابات افتراضية أو بديلة أحياناً؟",
    answer: "في حال غياب الاتصال بشبكة الإنترنت أو تجاوز الحد الأقصى لمفتاح الاستخدام التجريبي، تتدخل معالجات الطوارئ لتقديم مذكرات افتراضية من المعارف النموذجية لكل مادة لضمان استمرارية مراجعتك وعدم تعطيل طلابنا."
  },
  {
    question: "كيف يمكنني الحصول على ملخصات واختبارات بلغات أخرى غير العربية؟",
    answer: "في لوحة التلخيص، قم باختيار لغتك المفضلة من القائمة المنسدلة للغات (مثل الإنجليزية، الفرنسية، الألمانية)؛ وسيجبر النظام نماذج التوليد على تقديم جميع التلخيصات، والمفاهيم، وحالات الدراسة، والامتحانات بتلك اللغة بالكامل."
  }
];

export default function HelpFeedbackPanel() {
  const [category, setCategory] = useState<string>("تحسين دقة التلخيص");
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('student_feedbacks') || '[]');
    } catch {
      return [];
    }
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    const academicId = localStorage.getItem('last_academic_id') || 'STUDENT_USER';
    const newFeedback: FeedbackItem = {
      id: Math.random().toString(36).substring(7),
      category,
      rating,
      comments: comments.trim(),
      timestamp: new Date().toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      academicId
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('student_feedbacks', JSON.stringify(updated));

    setIsSubmitted(true);
    setComments("");
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4500);
  };

  return (
    <div id="help_feedback_wrapper" className="space-y-6 text-right">
      
      {/* Interactive Title Component */}
      <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="text-center md:text-right space-y-2 order-2 md:order-1">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center justify-center md:justify-end gap-2">
              <span className="text-blue-400 font-mono text-[11px] bg-blue-500/10 px-3 py-0.5 rounded-full border border-blue-500/20">SUPPORT</span>
              <span>مركز الدعم، إرسال الملاحظات، والشروط</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              يسعدنا دائماً مرافقتك ومساعدتك لإيجاد حلول لأية استفسارات فنية. تفضل بإرسال ملاحظاتك وتقييمك لتدريب خوارزمياتنا لتقديم أدق النتائج الأكاديمية والامتحانية.
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl shrink-0 order-1 md:order-2">
            <LifeBuoy className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Help Center & Terms (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FAQ Section */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs text-blue-400 font-bold">الأسئلة الشائعة والأخطاء التقنية</span>
              <HelpCircle className="h-4 w-4 text-blue-400" />
            </h3>

            <div className="space-y-3">
              {FAQS_DATA.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="border border-slate-850 rounded-xl overflow-hidden transition-all bg-[#14141A]">
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 flex items-center justify-between gap-4 text-right cursor-pointer"
                    >
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      <span className="text-xs font-bold text-slate-200 leading-snug">{faq.question}</span>
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-[#0a0a0c] text-xs text-slate-400 leading-relaxed border-t border-slate-850">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terms Of Service Section */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs text-blue-400 font-bold">الشروط والأحكام الأكاديمية العامة</span>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </h3>
            
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <p>
                باستخدامك لمنصة المساعد الأكاديمي، فإنك تقر وتلتزم بالامتثال الكامل لسياسات الأمان والمواثيق العلمية المعتمدة بالجامعات والمؤسسات التعليمية المنظمة:
              </p>
              
              <ul className="space-y-2 list-none pr-1">
                <li className="flex items-start justify-end gap-2 text-right">
                  <span>يتحمل الطالب التام والمنفرد كامل المسؤولية القانونية والأخلاقية عن أي محتوى يقوم برفعه (مثل أوراق الشروحات الخاصة بغيره أو دمج مساقات علمية محفوظة الحقوق للغير).</span>
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 shrink-0" />
                </li>
                <li className="flex items-start justify-end gap-2 text-right">
                  <span>من المتفق عليه علمياً أن مخرجات الذكاء الاصطناعي الأكاديمية هي مساعدة إرشادية وتدريبات تقييمية فقط، ويجب على الطلاب مراجعتها مع مراجعهم ومحاضريهم للتحقق الكامل من ملاءمة القوانين والأدلة العلمية.</span>
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 shrink-0" />
                </li>
                <li className="flex items-start justify-end gap-2 text-right">
                  <span>لا يجوز استخدام النظام في إحداث هجمات معطلة أو الوصول الممنوع للخوادم وقواعد معلومات الزملاء واللجان الامتحانية.</span>
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 shrink-0" />
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Right Side: Feedback Form & User Ratings */}
        <div className="space-y-6">
          
          {/* Active Suggestion dispatch form */}
          <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-2 flex items-center justify-end gap-2">
              <span className="text-xs text-blue-400 font-bold">إرسال رأي أو ملاحظة</span>
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </h3>

            {isSubmitted && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-400 font-bold flex flex-col items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>شكراً لمشاركتك! تم تسجيل ملاحظاتك وعرض تقييمك بنجاح في سجل الدعم لإرشاد مناديب التطوير.</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">نوع وموضوع الملاحظة:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#14141A] border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:border-blue-500 transition outline-none text-right dir-rtl"
                >
                  <option value="تحسين دقة التلخيص">تحسين دقة التلخيص بالملفات والمحاضرات</option>
                  <option value="تنوع أنماط الامتحانات">تنوع وصعوبة الأسئلة المتولدة واختباراتها</option>
                  <option value="تطوير واجهة المستخدم">تطوير عناصر التصميم وتنسيق الألوان</option>
                  <option value="مشكلة فنية أو عطل">الإبلاغ عن عطل فني في تصدير Word أو التسجيل</option>
                  <option value="أفكار مضافة جديدة">اقتراح ميزة إضافية نود إدراجها مستقبلاً</option>
                </select>
              </div>

              {/* Rating stars */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">تقييمك الإجمالي للمنصة:</label>
                <div className="flex items-center justify-end gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star 
                        className={`h-5 w-5 transition-colors ${
                          star <= rating 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-600 hover:text-amber-400'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-slate-400 text-xs font-mono font-bold mr-2">({rating}/5)</span>
                </div>
              </div>

              {/* Text comment */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold">تفاصيل تعليقك ورأيك:</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="اكتب ملاحظاتك لمطوري التطبيق هنا باقتضاب ولطف..."
                  required
                  rows={4}
                  className="w-full bg-[#14141A] border border-slate-800 text-xs text-slate-200 rounded-xl p-3 focus:border-blue-500 transition outline-none text-right placeholder:text-slate-600 min-h-[90px]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>إرسال تعليقي للجنة البرمجيات</span>
                <Send className="h-3.5 w-3.5" />
              </button>

            </form>
          </div>

          {/* Historic User Feedbacks list logs */}
          {feedbacks.length > 0 && (
            <div className="bg-[#111114] border border-slate-800 rounded-xl p-6 space-y-3 max-h-[290px] overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-400 border-b border-slate-850 pb-2">سجل الملاحظات والآراء الواردة (محلياً)</h4>
              <div className="space-y-2.5">
                {feedbacks.slice(0, 4).map((f) => (
                  <div key={f.id} className="p-3 bg-[#14141A] border border-slate-850 rounded-lg space-y-1.5 text-right">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] text-slate-500 font-mono">{f.timestamp}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-blue-400 font-bold">{f.category}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: f.rating }).map((_, i) => (
                            <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">{f.comments}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
