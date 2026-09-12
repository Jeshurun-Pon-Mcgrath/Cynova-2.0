import { z } from "zod";

export const questSchema = z.object({
  title: z.string().trim().min(3, "Quest title must be at least 3 characters.").max(80, "Quest title must be 80 characters or fewer."),
  description: z.string().max(300, "Briefing must be 300 characters or fewer.").optional(),
  category: z.enum(["Intellect", "Strength", "Vitality", "Charisma", "Creativity", "Discipline"]),
  difficulty: z.enum(["Easy", "Standard", "Challenging", "Epic"]),
  dueAt: z.string().min(1, "Choose a due date.").refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date.").refine((value) => Number.isNaN(Date.parse(value)) || Date.parse(value) > Date.now(), "Due date must be in the future."),
  estimatedMinutes: z.number().int().min(5, "Choose at least 5 minutes.").max(480, "Choose 480 minutes or fewer."),
  recurrence: z.enum(["None", "Daily", "Weekly"]),
  tags: z.string().max(120, "Tags must be 120 characters or fewer."),
});

export type QuestFormValues = z.infer<typeof questSchema>;
