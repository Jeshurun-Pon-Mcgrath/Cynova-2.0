"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { calculateQuestReward } from "@/lib/game-engine";
import { gameQueryKey } from "@/lib/query/game-query";
import { questSchema, type QuestFormValues } from "@/lib/validation/quest";
import { gameService, questService } from "@/services";
import { ATTRIBUTES, type Quest, type QuestInput } from "@/types/domain";

const difficulties = ["Easy", "Standard", "Challenging", "Epic"] as const;
const toLocalInput = (value: string) =>
  new Date(value).toISOString().slice(0, 16);
const toInput = (values: QuestFormValues): QuestInput => ({
  ...values,
  title: values.title.trim(),
  description: values.description?.trim(),
  dueAt: new Date(values.dueAt).toISOString(),
  tags: values.tags
    .split(",")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 6),
});

export function QuestForm({
  quest,
  defaultDueAt = "2030-01-01T18:00",
}: {
  quest?: Quest;
  defaultDueAt?: string;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const submitting = useRef(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuestFormValues>({
    resolver: zodResolver(questSchema),
    defaultValues: quest
      ? {
          title: quest.title,
          description: quest.description ?? "",
          category: quest.category,
          difficulty: quest.difficulty,
          estimatedMinutes: quest.estimatedMinutes,
          recurrence: quest.recurrence,
          dueAt: toLocalInput(quest.dueAt),
          tags: quest.tags.join(", "),
        }
      : {
          title: "",
          description: "",
          category: "Intellect",
          difficulty: "Standard",
          estimatedMinutes: 30,
          recurrence: "None",
          dueAt: defaultDueAt,
          tags: "",
        },
  });
  const category = useWatch({ control, name: "category" });
  const difficulty = useWatch({ control, name: "difficulty" });
  const minutes = useWatch({ control, name: "estimatedMinutes" });
  const reward = useMemo(
    () =>
      calculateQuestReward({
        category,
        difficulty,
        estimatedMinutes: Number(minutes) || 5,
      }),
    [category, difficulty, minutes],
  );
  const save = useMutation({
    mutationFn: (values: QuestFormValues) =>
      quest
        ? questService.update(quest.id, toInput(values))
        : questService.create(toInput(values)),
    onSuccess: async (saved) => {
      client.setQueryData(gameQueryKey, await gameService.getSnapshot());
      toast.success(
        quest ? "Quest updated." : `Quest created · ${reward.xp} XP awaits`,
      );
      router.push(`/quests/${saved.id}`);
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "The quest could not be saved.",
      ),
  });
  const validatedSubmit = handleSubmit(async (values) => {
    await save.mutateAsync(values);
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (submitting.current || save.isPending) {
      event.preventDefault();
      return;
    }
    submitting.current = true;
    void validatedSubmit(event).finally(() => {
      submitting.current = false;
    });
  };

  return (
    <form className="panel form-panel" noValidate onSubmit={submit}>
      <div className="form-grid">
        <Field label="Quest title" error={errors.title?.message} full>
          <input
            id="title"
            placeholder="e.g. Finish the accessibility audit"
            {...register("title")}
            aria-invalid={!!errors.title}
          />
        </Field>
        <Field
          label="Quest briefing (optional)"
          error={errors.description?.message}
          full
        >
          <textarea
            id="description"
            placeholder="Define what done looks like…"
            {...register("description")}
          />
        </Field>
        <Field label="Attribute path">
          <select id="category" {...register("category")}>
            {ATTRIBUTES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Difficulty">
          <select id="difficulty" {...register("difficulty")}>
            {difficulties.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Due date and time" error={errors.dueAt?.message}>
          <input
            id="dueAt"
            type="datetime-local"
            {...register("dueAt")}
            aria-invalid={!!errors.dueAt}
          />
        </Field>
        <Field
          label="Estimated duration"
          error={errors.estimatedMinutes?.message}
        >
          <input
            id="estimatedMinutes"
            type="number"
            min="5"
            max="480"
            {...register("estimatedMinutes", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Recurrence">
          <select id="recurrence" {...register("recurrence")}>
            <option>None</option>
            <option>Daily</option>
            <option>Weekly</option>
          </select>
        </Field>
        <Field label="Tags (comma separated)" error={errors.tags?.message}>
          <input id="tags" placeholder="focus, coding" {...register("tags")} />
        </Field>
        <div className="reward-preview full">
          <Sparkles />
          <span>
            <strong>+{reward.xp} XP</strong>
            <br />
            <small>
              {reward.attributeGain} {category}
            </small>
          </span>
          <Coins />
          <span>
            <strong>+{reward.gold} gold</strong>
            <br />
            <small>Category, difficulty, and duration</small>
          </span>
        </div>
        <div className="reward-preview full">
          <small>
            This preview is an estimate. The API recalculates and awards the
            authoritative values when the quest is completed.
          </small>
        </div>
      </div>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending
            ? "Saving quest…"
            : quest
              ? "Save changes"
              : "Create quest"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  const id = label.startsWith("Quest title")
    ? "title"
    : label.startsWith("Quest briefing")
      ? "description"
      : label.startsWith("Attribute")
        ? "category"
        : label === "Difficulty"
          ? "difficulty"
          : label.startsWith("Due")
            ? "dueAt"
            : label.startsWith("Estimated")
              ? "estimatedMinutes"
              : label === "Recurrence"
                ? "recurrence"
                : "tags";
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
