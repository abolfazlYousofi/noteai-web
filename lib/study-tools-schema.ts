import { z } from 'zod';

export const FlashcardSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

export const StudyToolsSchema = z.object({
  flashcards: z.array(FlashcardSchema).length(5),
  quiz: z.array(QuizQuestionSchema).length(3),
});

export type StudyTools = z.infer<typeof StudyToolsSchema>;