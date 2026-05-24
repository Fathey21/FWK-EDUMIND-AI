/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  name: string;
  academicId: string;
  nationalId: string;
  college: string;
  department: string;
  academyLevel: string;
}

export type FileInputType = 'pdf' | 'image' | 'audio' | 'video' | 'text';

export interface LectureInput {
  name: string;
  college: string;
  subject: string;
  fileType: FileInputType;
  fileName?: string;
  fileSize?: string;
  base64Data?: string; // Content of pdf, image, or media files
  rawText?: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  purpose: string;
}

export interface UseCase {
  scenario: string;
  analysis: string;
}

export interface LectureSummary {
  lectureName: string;
  subject: string;
  summaryMarkdown: string;
  keyConcepts: {
    title: string;
    details: string;
  }[];
  codeSnippets: CodeSnippet[];
  useCases: UseCase[];
}

export type QuestionType = 'mcq' | 'essay' | 'fill_blank' | 'true_false' | 'all';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'essay' | 'fill_blank' | 'true_false';
  questionText: string;
  options?: string[]; // for mcq
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  lectureName: string;
  subject: string;
  questions: QuizQuestion[];
}

export interface ExamCommittee {
  studentId: string;
  studentName: string;
  nationalId: string;
  college: string;
  seatNumber: string;
  hallName: string;
  floor: string;
  buildingName: string;
  campusGate: string;
  examDate: string;
  examTime: string;
  mapPathPoints: { x: number; y: number; label: string }[];
  instructions: string[];
}

export interface AlertNotification {
  id: string;
  title: string;
  dateTime: string;
  subject: string;
  type: 'quiz' | 'exam' | 'submission';
  alertTimeOffsetMin: number; // e.g., 30 mins before
  isNotified: boolean;
}
