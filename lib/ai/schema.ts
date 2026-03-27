import { z } from "zod";

export const QuestionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["trivia", "stat_puzzle"]),
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.string(), // Correct answer text
});

export const QuizGenerationSchema = z.array(QuestionSchema);

export type Question = z.infer<typeof QuestionSchema>;
