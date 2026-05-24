/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, HeadingLevel } from "docx";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Ensure Gemini Client is initialized lazy and securely
let genaiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genaiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY env is not set. AI functions will use placeholder mode.");
    }
    genaiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genaiClient;
}

// Map files and documents to correct MIME types for Gemini consumption
function getMimeType(fileName?: string, fileType?: string): string {
  if (!fileName) return "text/plain";
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "application/pdf";
    case "csv": return "text/csv";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc": return "application/msword";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls": return "application/vnd.ms-excel";
    case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "ppt": return "application/vnd.ms-powerpoint";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    case "gif": return "image/gif";
    case "mp2":
    case "mp3": return "audio/mp3";
    case "wav": return "audio/wav";
    case "m4a": return "audio/m4a";
    case "ogg": return "audio/ogg";
    case "aac": return "audio/aac";
    case "mp4": return "video/mp4";
    case "avi": return "video/x-msvideo";
    case "mov": return "video/quicktime";
    case "txt":
    case "rtf":
    case "json":
    case "xml":
    case "html":
    case "css":
    case "js":
    case "ts":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "h":
    case "sql": return "text/plain";
    default:
      if (fileType === "image") return "image/png";
      if (fileType === "audio") return "audio/mp3";
      if (fileType === "video") return "video/mp4";
      return "text/plain";
  }
}

const app = express();
const PORT = 3000;

// Body limit increased to handle base64 image, audio, or PDF payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Mock database of exam committees to support Student identity lookup
const mockCommittees: Record<string, any> = {
  "123456": {
    studentId: "123456",
    studentName: "فتحي الكيلاني",
    nationalId: "29904250109876",
    college: "كلية الحاسبات والمعلومات - جامعة المنوفية",
    seatNumber: "14502/ج",
    hallName: "معمل شبكات الحاسب والبرمجيات (معمل 2)",
    floor: "الدور الثاني - جناح علوم الحاسب",
    buildingName: "مبنى الكلية الجديد - مجمع الكليات بشبين الكوم",
    campusGate: "البوابة الرئيسية لجامعة المنوفية (شرق شبين الكوم)",
    examDate: "2026-06-01",
    examTime: "09:00 ص - 12:00 م",
    mapPathPoints: [
      { x: 10, y: 85, label: "البوابة الرئيسية لجامعة المنوفية" },
      { x: 30, y: 70, label: "ساحة مجمع الكليات" },
      { x: 50, y: 50, label: "مبنى كلية الحاسبات والمعلومات" },
      { x: 75, y: 35, label: "المعامل المركزية للدور الثاني" },
      { x: 85, y: 20, label: "معمل شبكات الحاسب والبرمجيات (اللجنة)" }
    ],
    instructions: [
      "يرجى الحضور قبل موعد الامتحان بـ 30 دقيقة على الأقل.",
      "يجب إبراز الكارنيه الجامعي والبطاقة الشخصية عند الدخول.",
      "ممنوع استخدام الهاتف المحمول أو الساعات الذكية تماماً في اللجنة.",
      "احرص على إحضار الحاسب المحمول الشخصي إذا تطلب الامتحان العملي ذلك."
    ]
  }
};

// --- API Endpoints ---

// User Identity verification (Login Portal)
app.post("/api/verify-login", (req, res) => {
  const { name, academicId, nationalId, college, department, academyLevel } = req.body;
  
  if (!academicId && !nationalId) {
    return res.status(400).json({ error: "يجب إدخال الرقم الأكاديمي أو الرقم القومي للدخول" });
  }

  // Lookup in database
  const queryKey = academicId || nationalId;
  const match = mockCommittees[queryKey];

  if (match) {
    return res.json({ status: "success", isMock: false, data: match });
  } else {
    // Generate dynamic customized exam data so no user is blocked or feels left out!
    const fallbackCollege = college || "الكلية العامة";
    const fallbackName = name || "طالب زائر";
    
    // Create detailed mapped paths for custom student dynamic registration
    const customCommittee = {
      studentId: academicId || "999999",
      studentName: fallbackName,
      nationalId: nationalId || "12345678901234",
      college: fallbackCollege + (department ? ` - قسم ${department}` : ""),
      seatNumber: `${Math.floor(Math.random() * 500) + 100} / م`,
      hallName: `قاعة الإمتحانات الكبرى رقم ${Math.floor(Math.random() * 5) + 1}`,
      floor: `الدور ${Math.random() > 0.5 ? "الأول علوي" : "الثاني"}`,
      buildingName: "مبنى مجمع المدرجات وقاعات الاختبارات والامتحانات الجدد",
      campusGate: "البوابة الرئيسية رقم 1",
      examDate: "2026-06-03",
      examTime: "09:30 ص - 12:30 م",
      mapPathPoints: [
        { x: 10, y: 15, label: "بوابة الكلية الرئيسية رقم 1" },
        { x: 45, y: 35, label: "ساحة الكلية الوسطى" },
        { x: 70, y: 65, label: "المجمع الجنوبي للمباني الأكاديمية" },
        { x: 85, y: 80, label: "مجمع المدرجات والقاعات (موقع اللجنة)" }
      ],
      instructions: [
        "يجب اصطحاب الكارنيه الجامعي لتسجيل الدخول السريع.",
        "الهواتف المحمولة مغلقة تماماً ومتروكة خارج القاعة مع الأمانات.",
        "الرجاء الالتزام التام بالهدوء والتعليمات الخاصة بالمراقبين المسؤولين."
      ]
    };
    return res.json({ status: "success", isMock: true, data: customCommittee });
  }
});

// Dynamic location instructions via Gemini search grounding if requested
app.post("/api/find-hall", async (req, res) => {
  const { query, college } = req.body;
  if (!query) return res.status(400).json({ error: "الرجاء كتابة اسم المبني أو القاعة للبحث" });

  try {
    const ai = getGenAI();
    let prompt = `أنت مرشد جامعي ذكي في الكلية ${college || "الجامعة المصرية"}. 
ساعدني في الوصول إلى "${query}" واشرح لي كيفية الدخول وموقع اللجنة أو المكان بدقة في نقاط بسيطة وواضحة جداً باللغة العربية.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    return res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error in finding hall:", err);
    return res.json({ text: `للوصول إلى ${query}، ينصح بالدخول من البوابة المخصصة لكليتك، والتوجه متبعاً اللوحات الإرشادية إلى قطاع المعامل المركزية أو مجمع قاعات المحاضرات الرئيسي. تفضل بزيارة مكتب الإرشاد والشؤون في مبنى إدارة الكلية للمزيد من التعليمات الدقيقة.` });
  }
});

// Ibn Al-Haytham portal copy-paste academic record/transcript parser using Gemini 3.5 Flash
app.post("/api/gemini/parse-ibn-haytham", async (req, res) => {
  const { rawText } = req.body;
  if (!rawText || rawText.trim().length === 0) {
    return res.status(400).json({ error: "الرجاء لصق النص المنسوخ من بوابة ابن الهيثم أولاً" });
  }

  try {
    const ai = getGenAI();
    const parsePrompt = `You are an expert AI software engineer and system compiler specialized in academic structures.
Analyze the following raw copied text from the official Egyptian "Ibn Al-Haytham" university management system (نظام ابن الهيثم لإدارة الجامعات / البوابة الإلكترونية للخدمات الطلابية).
Extract all relevant academic databases, student info, courses, actual exam/semester marks, and GPAs accurately.
Identify raw subjects (e.g. "هندسة البرمجيات", "نظم قواعد البيانات") and grades (sometimes listed as Excellent/ممتاز, Very Good/جيد جداً, or percentages like 80% or marks like 80/100).

Pasted Text:
"""
${rawText}
"""

Please parse and return the data in a strict JSON format with the following keys:
1. "studentName": Look for student's full name in the text. If not found, guess or leave empty "".
2. "college": Look for the college name (e.g. "كلية الحاسبات والمعلومات"). If not found, leave "".
3. "gpa": The GPA or cumulative percentage if mentioned (e.g. "3.2" or "75.4%"). If not found, leave "".
4. "academicId": The Student Academic ID if found.
5. "attempts": An array of mock/real exam achievements extracted or derived from the subjects. Each item MUST have:
   - "id": A unique string like "heitham-1", "heitham-2" etc.
   - "subject": The Arabic name of the course/subject.
   - "lectureName": A descriptive topic name (e.g. "الامتحان النهائي للفصل الدراسي" or "أداء التقييم الدوري للمادة")
   - "score": Numeric mark obtained (usually out of 100 or 20 or 150). Try to extract it. If only grade like ممتاز/جيد جداً is there, assign standard matching scores (ممتاز=90, جيد جدا=80, جيد=70, مقبول=60, ضعيف=40). Default to 80.
   - "total": Maximum possible score (usually 100, or matching the score scale).
   - "percentage": Calculated percentage (score / total) * 100. Must be between 0 and 100.
   - "level": Set to "standard" or "deep_challenge" (alternate them or choose based on score, <70 is deep_challenge, >=70 is standard).
   - "timestamp": A valid ISO date string representing a date relative to standard semesters (e.g., matching the dates stated or formatted relative to current year 2026).

Double check your parsing. If the text does not look like university transcript data, extract any subjects or courses you can find anyway, making up realistic default percentages based on what's found. Return only a valid RFC8259 compliant JSON document matching the schema. Do not include markdown tags (\`\`\`json) inside the JSON response itself.`;

    const systemInstruction = "You are a precise academic data analyzer parser that outputs pure JSON representing university transcripts and credentials from Middle-East portal layouts.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parsePrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            college: { type: Type.STRING },
            gpa: { type: Type.STRING },
            academicId: { type: Type.STRING },
            attempts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  lectureName: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                  percentage: { type: Type.NUMBER },
                  level: { type: Type.STRING },
                  timestamp: { type: Type.STRING }
                },
                required: ["id", "subject", "lectureName", "score", "total", "percentage", "level", "timestamp"]
              }
            }
          },
          required: ["attempts"]
        }
      }
    });

    const parsedJson = JSON.parse(response.text.trim());
    return res.json({ status: "success", data: parsedJson });
  } catch (err: any) {
    console.error("Ibn Al-Haytham parse error:", err);
    return res.status(500).json({ error: "فشل نظام الذكاء الاصطناعي في تحليل محتويات النص المقروء أو التنسيق تالف، يرجى المحاولة بنسخ أدق للمستند." });
  }
});

// Primary Endpoint: AI Lecture Summarizer (using Google GenAI gemini-3.5-flash)
app.post("/api/gemini/summarize", async (req, res) => {
  const { lectureName, college, subject, fileType, fileName, base64Data, rawText, language, files } = req.body;

  if (!lectureName) {
    return res.status(400).json({ error: "اسم المحاضرة أو الموضوع مطلوب" });
  }

  const targetLang = language || "العربية";

  try {
    const ai = getGenAI();
    
    let promptContext = `الموضوع المراد تلخيصه:
اسم المحاضرة: "${lectureName}"
الكلية والمؤسسة التعليمية: "${college || "كافة الكليات"}"
المادة الدراسية: "${subject || "كل المواد"}"
نوعية الملف المرفق: "${fileType}"
اللغة المطلوبة للتلخيص والمخرجات: "${targetLang}"

`;

    let parts: any[] = [];
    
    if (fileType === "text" && rawText) {
      promptContext += `محتوى المحاضرة المكتوب:\n${rawText}\n\n`;
    }

    // Process multiple academic files list if provided
    if (files && Array.isArray(files) && files.length > 0) {
      promptContext += `لقد قام الطالب برفع الملفات التالية:\n`;
      for (const f of files) {
        if (f.base64Data) {
          const mime = getMimeType(f.fileName, f.fileType);
          parts.push({
            inlineData: {
              mimeType: mime,
              data: f.base64Data
            }
          });
          promptContext += `- ملف باسم [${f.fileName}] من نوع [${f.fileType || "عام"}]\n`;
        } else if (f.rawText) {
          promptContext += `- النص أو الكود الملحق لملف [${f.fileName}]:\n${f.rawText}\n`;
        }
      }
      promptContext += `\nقم بقراءة وفهم ومطابقة كافة الملفات وتفسير مقتنياتها بدقة متناهية باللغة المطلوبة [${targetLang}].\n`;
    } else if (base64Data) {
      const mimeType = getMimeType(fileName, fileType);
      try {
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
        promptContext += `لقد قام الطالب برفع ملف من نوع [${fileType}] باسم [${fileName}]. قم بقراءة ومراجعة وتلخيص هذا الملف الملحق بشكل كامل ودقيق باللغة المستهدفة [${targetLang}].\n`;
      } catch (attachErr) {
        console.error("Attachment processing error", attachErr);
        promptContext += `(ملاحظة: فشل جزئي في دمج الملف كـ base64، اعتمد على اسم المحاضرة [${lectureName}] ومادة [${subject}] لإنشاء ملخص احترافي وتفصيلي باللغة [${targetLang}] من المعارف الثرية المعتمدة لطلاب الجامعات.)\n`;
      }
    } else {
      promptContext += `(اعتمد بشكل كامل على مهاراتك وخبرتك الأكاديمية الشاملة لتوليد تلخيص نموذجي فائق الجودة لمحاضرة بعنوان "${lectureName}" في مادة "${subject}" الخاصة بكلية "${college}"، بما في ذلك الأكواد البرمجية والحلول الرياضية والحالات العملية في حال كان الموضوع هندسياً، علمياً، طبياً أو تجارياً باللغة المطلوبة [${targetLang}].)`;
    }

    const systemInstruction = `You are an elite University Professor, Academic Dean, and advanced AI Academic Assistant. Your task is to provide extremely high-fidelity, comprehensive lecture summaries with absolute clarity and precision. 

You MUST generate all outputs strictly in the specified target language: "${targetLang}" (e.g., if the language is English, write all markdown text, concepts, and scenarios in English; if it is Arabic, write them in beautiful, fluent Academic Arabic, etc.). Note that code snippets and mathematical formulas remain in their native technical formats.

Core Directives for Advanced Text Analysis and Synthesis:
1. Deep Context & Analytical Comprehension: Do not just write a generic overview. Deeply analyze the material, resolve academic jargon, and extract complex relationships, root paradigms, structures, and systems.
2. Structure and Form: Your output must be a fully comprehensive guide of high educational value.
3. Accurate Formula & Code Extraction: Capture all key math formulas, equations, data flows, and algorithms, giving them clean definitions.

Provide the response in structured JSON format with:
1. "lectureName": A beautifully formatted academic title in the specified language.
2. "subject": The target subject.
3. "summaryMarkdown": An incredibly deep, exhaustive, and professionally structured academic summary in markdown format (at least 5-8 detailed sections, using clean styling, visual bullet points, subheaders, and bold terminology). It must provide outstanding conceptual clarity and complete coverage of all topics.
4. "keyConcepts": An array of core terminologies, keywords, and foundational theories extracted from the context. Each concept must have: "title" (the specific term) and "details" (its elaborate definition) in "${targetLang}".
5. "codeSnippets": An array of key coding examples, data scripts, SQL blocks, or mathematical formulas/equations (using LaTeX styles if relevant) that support the lecture. Each block contains: "language" (e.g. python, cpp, math, sql, etc.), "code", and "purpose" (written in "${targetLang}").
6. "useCases": An array of highly immersive, realistic case studies, scenarios, or practical application workflows illustrating the principles. Each containing: "scenario" (a comprehensive description of the real-world challenge) and "analysis" (the precise step-by-step resolution based on the lecture's principles) written in "${targetLang}".

All output fields (except the technical code fields) must be completely written in the requested language: "${targetLang}". Double check consistency before returning the JSON.`;

    parts.push({ text: promptContext });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lectureName: { type: Type.STRING },
            subject: { type: Type.STRING },
            summaryMarkdown: { type: Type.STRING, description: "الملخص الشامل الطويل بالتنسيق الجمالي المناسب ماركداون" },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  details: { type: Type.STRING }
                },
                required: ["title", "details"]
              }
            },
            codeSnippets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  language: { type: Type.STRING },
                  code: { type: Type.STRING },
                  purpose: { type: Type.STRING }
                },
                required: ["language", "code", "purpose"]
              }
            },
            useCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scenario: { type: Type.STRING },
                  analysis: { type: Type.STRING }
                },
                required: ["scenario", "analysis"]
              }
            }
          },
          required: ["lectureName", "subject", "summaryMarkdown", "keyConcepts", "codeSnippets", "useCases"]
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini summarize error:", error);
    return res.json({
      lectureName: lectureName,
      subject: subject || "المادة الدراسية العامة",
      summaryMarkdown: `## الملخص الدراسي: ${lectureName}\n\nهذا ملخص بديل تم توليده تلقائياً للتأكيد على تفاصيل مادة **${subject || "الدراسات الأكاديمية"}** لطلاب كلية **${college || "الجامعة"}**.\n\n### 1. المقدمة والأفكار الجوهرية\nتعتبر هذه المحاضرة من الركائز الأساسية التي تستعرض النماذج العلمية الحديثة، وتركز بوضوح على منهجيات القياس والتحليل الإكلينيكي والنظري للمعلومات الفنية والبيانات الأساسية.\n\n### 2. المكونات الرئيسية للتطبيقات العملية\n*   توزيع المجموعات والمساقات التعليمية لضمان الاستفادة الكاملة.\n*   معايير اختبار مبرهنات الأنماط والنظم المتطورة.\n*   استكشاف الأخطاء وكيفية تحليلها باحترافية.\n\n### 3. الخلاصة ونتائج البحث\nأبدى الطلاب نتائج متميزة ومستويات فهم عالية خلال نقاش هذه الأفكار تحت رعاية المحاضرين، ونوصي المراجعة الدائمة والتدقيق قبل الشروع في الإمتحانات والتدريبات الشاملة.`,
      keyConcepts: [
        { title: "المنهجية الأكاديمية", details: "مجموعات القواعد والأساسيات المتبعة للتحقق من النظريات وتطبيق المخرجات." },
        { title: "الكفاءة التشغيلية", details: "مدى قدرة الأنظمة أو الآليات أو الحلول لتقديم النتائج المتوقعة بأقل وقت وجهد." }
      ],
      codeSnippets: [
        { language: "math", code: "f(x) = \\sum_{i=0}^{n} (w_i \\cdot x_i) + b", purpose: "المعادلة الأساسية لحساب الفروق والترجيحات في النماذج التحليلية القياسية" }
      ],
      useCases: [
        { scenario: "سيناريو تطبيق في بيئة عمل جامعية", analysis: "يتم فحص مخرجات الطلاب ومقارنتها بنتائج النماذج القياسية للتحسين المستمر." }
      ]
    });
  }
});

// Secondary Endpoint: Quiz & Questions Creator
app.post("/api/gemini/generate-questions", async (req, res) => {
  const { summaryText, lectureName, subject, questionType, count, language } = req.body;

  const targetLang = language || "العربية";

  try {
    const ai = getGenAI();
    const countNum = parseInt(count) || 5;
    
    let prompt = `قم بصياغة اختبار ذكي دقيق يحتوي بدقة على عدد [${countNum}] من الأسئلة المتنوعة للامتحانات المعتمدة باللغة المحددة [${targetLang}].
تفاصيل المحاضرة:
اسم المحاضرة: "${lectureName || "محاضرة أكاديمية"}"
المادة الدراسية: "${subject || "كل المواد"}"
نوع الأسئلة المطلوب توليده: "${questionType || "all"}" (خيارات: mcq اختياري, essay مقالي, fill_blank أكمل بقيمة مناسبة، true_false صح أو خطأ، all متنوع).

المرجع النصي المعتمد أو الملخص:\n${summaryText || "استعن بمعارفك لإنشاء اختبار أكاديمي ممتاز"}\n\n`;

    const systemInstruction = `You are an elite academic assessment designer, university dean, and head of the board of examinations. Your task is to design extremely balanced, accurate, and challenging university exam questions in the specified target language: "${targetLang}".

You MUST generate all outputs strictly in "${targetLang}" (e.g., if the language is English, write all questions, options, answers, and explanations in English; if it is Arabic, write them in eloquent, high-standard academic Arabic).

Core Verification Directives:
1. Academic Rigor & Balance: Ensure questions assess depth of knowledge, logical deductions, error resolution, core concepts, calculations, and formulas. Avoid overly simplistic questions.
2. Question Diversity:
   - "mcq": Must provide 4 distinct, plausible options where exactly one is clearly correct.
   - "true_false": Statement must be intellectually deep. Correct answer must be precisely either "صح" / "خطأ" (or "True" / "False" depending on the target language, or standard equivalents). Let's use standard literal answers in the target language.
   - "fill_blank": Must check key terms or numbers.
   - "essay": High-order synthesis or explanation questions. Matches keys and bulleted guidelines for grading.
3. Perfect JSON Format compliance: Output must be a stable, parsed JSON containing a single root "questions" array. Each question must include: "id" (e.g. q1, q2...), "type" (one of: mcq, true_false, fill_blank, essay), "questionText" (the question), "options" (array of 4 options for mcq, otherwise empty array), "correctAnswer" (text of correct option, or "صح"/"خطأ" / "True"/"False" or the filled word, or model essay guidelines), and "explanation" (rich academic justification of why this answer is correct and what the context teaches).

Ensure that everything is written gracefully in "${targetLang}" to guarantee support for subjects in all specified languages.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: "mcq أو essay أو fill_blank أو true_false" },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "questionText", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini quiz generation error:", error);
    
    // Fallback exam questions if Gemini fails
    return res.json({
      questions: [
        {
          id: "q_fb_1",
          type: "mcq",
          questionText: targetLang === "English" 
            ? "What is the primary benefit of active recall and interactive testing in academic study?" 
            : `ما هي الميزة الأساسية التي تقدمها المراجعة الدورية للمحاضرات الجامعية وسجلات الاختبار التفاعلي؟`,
          options: targetLang === "English"
            ? [
                "Consolidating memory and increasing cognitive retention",
                "Reducing average sleep duration",
                "Powering down electronic devices completely",
                "Changing academic degrees automatically"
              ]
            : [
                "تثبيت المفاهيم العلمية وتحسين مستوى التحصيل والاستيعاب",
                "تقليل عدد ساعات النوم اليومي للطالب",
                "إيقاف تشغيل الأجهزة الإلكترونية بشكل دائم",
                "تغيير التخصص الجامعي تلقائياً"
              ],
          correctAnswer: targetLang === "English"
            ? "Consolidating memory and increasing cognitive retention"
            : "تثبيت المفاهيم العلمية وتحسين مستوى التحصيل والاستيعاب",
          explanation: targetLang === "English"
            ? "Active testing forces the brain to retrieve information pathways, leading to much stronger synapses and memory retention."
            : "المراجعة المستمرة ومحاكاة الامتحانات تلعب دوراً نفسياً وعلمياً حاسماً في تهيئة المخ للاسترجاع السريع والمثالي للبيانات أثناء اللجان الحقيقية."
        },
        {
          id: "q_fb_2",
          type: "true_false",
          questionText: targetLang === "English"
            ? "Using modern proven architectures decrease integration friction and enhance overall efficiency."
            : "تجنب استخدام المناهج والأكواد البرمجية التجريبية والمثبتة يساهم دوماً في تقليص الجهد المبذول في التصنيع الطبي والهندسي.",
          correctAnswer: targetLang === "English" ? "True" : "خطأ",
          explanation: targetLang === "English"
            ? "Correct. Adapting established patterns prevents bugs and saves valuable production time."
            : "بالعكس، الاعتماد على التطبيقات والأكواد المرنة المثبتة يمنع هدر الوقت ويعزز الاستكشاف الآمن للتفاصيل التقنية."
        }
      ]
    });
  }
});

// Primary Endpoint: PDF/Word (.docx) Exporter using docx library
app.post("/api/export-docx", async (req, res) => {
  const { lectureName, subject, college, summaryMarkdown, keyConcepts, questions } = req.body;

  try {
    const lectureTitle = lectureName || "ملخص محاضرة";
    const subjectTitle = subject || "عام";
    const collegeTitle = college || "الجامعة";

    // Build Word Document Programmatically
    const sections: any[] = [];

    const paragraphList = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "ملخص ومستودع أسئلة أكاديمي ذكي",
            bold: true,
            size: 36,
            color: "1e3a8a",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({ text: "كلية: ", bold: true, size: 24 }),
          new TextRun({ text: `${collegeTitle}  |  `, size: 24 }),
          new TextRun({ text: "المادة: ", bold: true, size: 24 }),
          new TextRun({ text: `${subjectTitle}  |  `, size: 24 }),
          new TextRun({ text: "الموضوع: ", bold: true, size: 24 }),
          new TextRun({ text: `${lectureTitle}`, size: 24 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "أولاً: الملخص الدراسي والتوصيف",
            bold: true,
            size: 28,
            color: "0f172a",
          }),
        ],
      })
    ];

    // Read and break paragraphs from summary markdown
    if (summaryMarkdown) {
      const cleanSummary = summaryMarkdown.replace(/[*#`_\-]/g, ""); // Strip raw markdown indicators
      const lines = cleanSummary.split("\n").filter((l: string) => l.trim() !== "");
      for (const line of lines) {
        paragraphList.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: line,
                size: 24,
              }),
            ],
          })
        );
      }
    } else {
      paragraphList.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "لا يوجد نص ملخص متاح.", size: 24 })],
        })
      );
    }

    // Key concepts
    if (keyConcepts && Array.isArray(keyConcepts) && keyConcepts.length > 0) {
      paragraphList.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: "المصطلحات والمفاهيم الرئيسية:",
              bold: true,
              size: 26,
              color: "1e3a8a",
            }),
          ],
        })
      );

      for (const concept of keyConcepts) {
        paragraphList.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: `• ${concept.title}: `, bold: true, size: 24, color: "0284c7" }),
              new TextRun({ text: concept.details, size: 24 }),
            ],
          })
        );
      }
    }

    // Questions section
    if (questions && Array.isArray(questions) && questions.length > 0) {
      paragraphList.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 400, after: 150 },
          children: [
            new TextRun({
              text: "ثانياً: الاختبار التقييمي والأسئلة النموذجية",
              bold: true,
              size: 28,
              color: "0f172a",
            }),
          ],
        })
      );

      questions.forEach((q: any, index: number) => {
        const qTypeAr = 
          q.type === "mcq" ? "اختياري" :
          q.type === "essay" ? "مقالي" :
          q.type === "fill_blank" ? "أكمل الفراغ" : "صح أو خطأ";

        paragraphList.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: `س ${index + 1} [${qTypeAr}]: `, bold: true, size: 24, color: "1e3a8a" }),
              new TextRun({ text: q.questionText, bold: true, size: 24 }),
            ],
          })
        );

        // Options if MCQ
        if (q.type === "mcq" && q.options && Array.isArray(q.options)) {
          q.options.forEach((opt: string, optIdx: number) => {
            const letter = String.fromCharCode(1571 + optIdx); // Arabic letters (أ، ب، ج، د)
            paragraphList.push(
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 50, after: 50 },
                children: [
                  new TextRun({ text: `    (${letter}) `, bold: true, size: 22 }),
                  new TextRun({ text: opt, size: 22 }),
                ],
              })
            );
          });
        }

        // Answers
        paragraphList.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 50, after: 50 },
            children: [
              new TextRun({ text: "    الإجابة النموذجية: ", bold: true, size: 22, color: "16a34a" }),
              new TextRun({ text: q.correctAnswer, size: 22, color: "16a34a" }),
            ],
          })
        );

        // Explanation
        paragraphList.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 50, after: 150 },
            children: [
              new TextRun({ text: "    الشرح والتحليل: ", bold: true, size: 22, color: "4b5563" }),
              new TextRun({ text: q.explanation, size: 22, color: "4b5563", italics: true }),
            ],
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphList,
        },
      ],
    });

    const b64 = await Packer.toBase64String(doc);
    const filename = encodeURIComponent(`${lectureTitle}_تلخيص_وأسئلة.docx`);
    
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${filename}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    
    const buffer = Buffer.from(b64, "base64");
    return res.send(buffer);

  } catch (error: any) {
    console.error("Error creating DOCX file:", error);
    return res.status(500).json({ error: "فشل في تصدير ملف الوورد" });
  }
});


// Third-Party Exam Solver and Grader Endpoint
app.post("/api/gemini/solve-exam", async (req, res) => {
  const { examTitle, subject, college, rawText, files, language } = req.body;
  if (!examTitle) {
    return res.status(400).json({ error: "عنوان الامتحان مطلوب" });
  }
  const targetLang = language || "العربية";

  try {
    const ai = getGenAI();
    let promptContext = `طلب حل للامتحان متميز ومفصل كلياً:
عنوان الامتحان: "${examTitle}"
المادة الدراسية: "${subject || "كل المواد"}"
الكلية والمؤسسة: "${college || "عام"}"
اللغة المطلوبة للرد والشرح: "${targetLang}"

`;

    let parts: any[] = [];
    if (rawText) {
      promptContext += `نص الأسئلة المدخل يدوياً من الطالب:\n${rawText}\n\n`;
    }

    if (files && Array.isArray(files) && files.length > 0) {
      promptContext += `لقد قام الطالب برفع الملفات/الصور التالية للامتحان:\n`;
      for (const f of files) {
        if (f.base64Data) {
          const mime = getMimeType(f.fileName, f.fileType);
          parts.push({
            inlineData: {
              mimeType: mime,
              data: f.base64Data
            }
          });
          promptContext += `- ملف ومستند باسم [${f.fileName}] من نوع [${f.fileType || "عام"}]\n`;
        } else if (f.rawText) {
          promptContext += `- النص الملتقط من الملف [${f.fileName}]:\n${f.rawText}\n`;
        }
      }
    }

    promptContext += `\nالمطلوب منك كبروفسور متميز وعميد أكاديمي ومدرس جامعي فائق الخبرة:\n`;
    promptContext += `1. استخراج كافة الأسئلة والتمارين والمسائل البرمجية، المحاسبية، الهندسية، الطبية، أو الاقتصادية المذكورة في المدخلات.\n`;
    promptContext += `2. حل كل تمرين أو سؤال بدقة متناهية وإعطاء الإجابة الكاملة والتفصيلية والقاطعة والذكية.\n`;
    promptContext += `3. تزويد الطالب بشرح تفصيلي خطوة بخطوة للحل، مع ذكر المرجع العلمي وسياق القاعدة العلمية لتسهيل المراجعة كمعلم فوري.\n`;
    promptContext += `4. صياغة الرد كاملاً وبأعلى جودة باللغة: "${targetLang}".\n`;

    const systemInstruction = `You are an elite University Professor, Exam Grader, and Chief Academic Tutor. Your task is to extract, solve, and explain entire exam paper questions.
You MUST analyze the provided text or attachments, identify all test questions, and solve them with outstanding academic precision.
For each question, explain the mathematical/logical/clinical/computational steps carefully in "${targetLang}".

Provide the response in structured JSON format with:
1. "solvedTitle": A beautiful academic title for the exam.
2. "overallAnalysis": A helpful analysis of the exam's topics, and preparatory recommendations.
3. "solutions": An array of objects, each containing:
   - "questionNumber": Identifier (e.g. "Question 1" or "السؤال الأول - أ")
   - "questionText": The text of the question
   - "solvedAnswer": The final direct answer or resolution
   - "explanationSteps": A deep, structural step-by-step breakdown explaining the theory, formulas, and logic behind the answer
   - "scientificReference": The academic source or core scientific chapter/paradigm related to this.
4. "recommendations": Student recommendations.`;

    parts.push({ text: promptContext });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            solvedTitle: { type: Type.STRING },
            overallAnalysis: { type: Type.STRING },
            solutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  solvedAnswer: { type: Type.STRING },
                  explanationSteps: { type: Type.STRING },
                  scientificReference: { type: Type.STRING }
                },
                required: ["questionNumber", "questionText", "solvedAnswer", "explanationSteps", "scientificReference"]
              }
            },
            recommendations: { type: Type.STRING }
          },
          required: ["solvedTitle", "overallAnalysis", "solutions", "recommendations"]
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Exam solving error:", error);
    return res.json({
      solvedTitle: examTitle || "حل الامتحان الأكاديمي",
      overallAnalysis: `عذراً، واجهنا صعوبة في التوليد التلقائي للامتحان من خوادم الذكاء الاصطناعي بشكل هيكلي. لقد تم إعداد هذا الحل النموذجي التلقائي لمساعدتكم الفورية بناءً على المادة المطلوبة: ${subject || "المسار الجامعي"}.`,
      solutions: [
        {
          questionNumber: "سؤال 1",
          questionText: "كيف نقوم بمواجهة ومعالجة المسائل المعقدة في هذا المساق الأكاديمي؟",
          solvedAnswer: "عن طريق تفكيك البيانات وتطبيق المبدأ العلمي المناسب.",
          explanationSteps: "نقوم أولاً بتفصيل المعطيات ثم وضع الفرضيات السليمة واستخلاص النتائج القياسية.",
          scientificReference: "الفصل الأول: مدخل للأنظمة والتحليلات المتطورة."
        }
      ],
      recommendations: "ينصح دائماً بالرجوع للمحاضرات المرجعية، والتركيز على حل التطبيقات المباشرة لضمان الفهم الشامل."
    });
  }
});

// Dynamic Tutoring Chatbot Endpoint
app.post("/api/gemini/tutor-chat", async (req, res) => {
  const { history, message, solvedExamContext, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: "الرسالة مطلوبة" });
  }
  const targetLang = language || "العربية";

  try {
    const ai = getGenAI();
    let systemInstruction = `You are "بروفسور التدريس الفوري" (The Expert Dynamic University Tutor). 
Your student has solved or is reviewing an exam or academic topic. 
Your goal is to explain and interpret questions, math steps, accounting ledgers, medical facts, or concepts in a friendly, highly clear, and encouraging manner in "${targetLang}".
Use rich text formatting (markdown) with bullet points and bolding to make explanations highly readable on phones and computers.
If the student asks you to solve or explain further, provide clear proofs. Never give lazy or truncated answers.`;

    let userContextPrompt = `سياق الامتحان الحالي قيد المراجعة:\n${JSON.stringify(solvedExamContext || {})}\n\n`;
    
    // Convert history format to chat prompt or pass messages
    let promptParts: any[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        promptParts.push({ text: `${msg.role === 'user' ? 'الطالب' : 'المعلم'}: ${msg.content}` });
      }
    }
    
    promptParts.push({ text: `${userContextPrompt}الطالب يسألك: "${message}"\nأجب عليه كمعلم جامعي يفسر ويشرح بالتفصيل الممل والتبسيط باللغة [${targetLang}]:` });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: promptParts },
      config: {
        systemInstruction
      }
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error("Tutor chat error:", error);
    return res.json({ text: "عذراً، واجه المعلم الشخصي مشكلة مؤقتة في الاتصال بخادم المعرفة الحية. الرجاء تكرار استفسارك مجدداً وسأكون سعيداً بشرحه لك!" });
  }
});


// Safely derive directory path in both ES Modules (development) and CommonJS (compiled production)
const isCjs = typeof __dirname !== "undefined";
const currentDir = isCjs ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Register Vite or serve static assets based on environment
async function startServer() {
  // Pinpoint the dist directory
  let distPath = path.join(process.cwd(), "dist");
  if (!fs.existsSync(path.join(distPath, "index.html"))) {
    if (fs.existsSync(path.join(currentDir, "index.html"))) {
      distPath = currentDir;
    } else if (fs.existsSync(path.join(currentDir, "dist", "index.html"))) {
      distPath = path.join(currentDir, "dist");
    }
  }

  const hasIndexHtml = fs.existsSync(path.join(distPath, "index.html"));

  // Determine if we are running in production compiled mode
  const isCompiled = isCjs || !fs.existsSync(path.join(currentDir, "server.ts"));
  const isProduction = isCompiled || process.env.NODE_ENV === "production";

  if (isProduction && hasIndexHtml) {
    // Production mode - Serve static compiled files
    console.log(`Starting server in Production mode. Serving static assets from: ${distPath}`);
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static production files successfully.");
  } else {
    // Development mode or missing production build assets - fallback to Vite live middleware
    console.log("Starting server in Development/Fallback mode with Vite Middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Vite Development Middleware integrated.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running securely on port ${PORT}`);
  });
}

startServer();
