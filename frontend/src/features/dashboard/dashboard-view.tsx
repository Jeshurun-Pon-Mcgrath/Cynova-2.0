"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Check,
  Coins,
  Flame,
  ShieldAlert,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { AttributeRadar } from "@/components/charts/attribute-radar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap } from "@/lib/gsap/register";
import { useGameQuery } from "@/lib/query/game-query";
import { xpPercent } from "@/lib/utils";
import type { CompletionReward, Quest } from "@/types/domain";
import { useCompleteQuest } from "@/features/quests/use-complete-quest";

export function DashboardView() {
  const { data: game, isError, isFetching, refetch } = useGameQuery();
  const orb = useRef<HTMLSpanElement>(null);
  const xpTarget = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [levelReward, setLevelReward] = useState<CompletionReward | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const complete = useCompleteQuest({
    onReward: (reward) => {
      setAnnouncement(
        `Quest complete. Gained ${reward.xp} XP, ${reward.gold} gold, and ${reward.attributeGain} ${reward.attribute}.`,
      );
      if (!reducedMotion && orb.current && xpTarget.current) {
        const target = xpTarget.current.getBoundingClientRect();
        gsap.set(orb.current, { display: "block", x: 0, y: 0, opacity: 1 });
        gsap.to(orb.current, {
          duration: 0.7,
          motionPath: {
            path: [
              { x: 40, y: -55 },
              {
                x: target.left - window.innerWidth / 2,
                y: target.top - window.innerHeight / 2,
              },
            ],
          },
          ease: "power2.in",
          onComplete: () => gsap.set(orb.current, { display: "none" }),
        });
      }
      if (reward.levelsGained > 0) setLevelReward(reward);
    },
  });
  const active = game.quests.filter((quest) => quest.status === "active");

  if (isError)
    return (
      <div className="panel empty-state">
        <strong>The realm link is unstable.</strong>
        <p>Your local game state is safe.</p>
        <Button onClick={() => refetch()}>Retry connection</Button>
      </div>
    );
  return (
    <>
      <span ref={orb} className="xp-orb" aria-hidden="true" />
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>
      <div className="page-head">
        <div>
          <span className="eyebrow">Day {game.streak.days} · Aetherfall</span>
          <h1>Good evening, {game.player.name}.</h1>
          <p>
            {active.length} quests remain.{" "}
            {game.streak.securedToday
              ? "Your streak is secured today."
              : "Complete one quest to secure your streak."}
          </p>
        </div>
        <Link className="button button-primary" href="/quests/new">
          + Quick quest
        </Link>
      </div>
      <section className="stat-grid" aria-label="Today's summary">
        <article className="panel stat">
          <span className="stat-label">
            <Sparkles />
            Level
          </span>
          <strong>{game.progression.level}</strong>
          <span className="muted">{game.player.archetype}</span>
        </article>
        <article className="panel stat">
          <span className="stat-label">
            <Coins />
            Gold
          </span>
          <strong>{game.progression.gold.toLocaleString()}</strong>
          <span className="gold">Spend in Rewards</span>
        </article>
        <article className="panel stat">
          <span className="stat-label">
            <Flame />
            Streak
          </span>
          <strong>{game.streak.days} days</strong>
          <span className={game.streak.securedToday ? "green" : "ember"}>
            {game.streak.securedToday ? "Secured today" : "Not secured yet"}
          </span>
        </article>
        <article className="panel stat">
          <span className="stat-label">
            <Trophy />
            Completed today
          </span>
          <strong>{game.progression.completedToday}</strong>
          <span className="green">
            {game.progression.weeklyConsistency}% weekly
          </span>
        </article>
      </section>
      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <section className="panel">
            <div className="panel-head">
              <h2>Today&apos;s quests</h2>
              <div>
                {process.env.NEXT_PUBLIC_ENABLE_MOCK_API === "true" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const { simulateNextCompletionFailure } =
                        await import("@/services/mock/game-service");
                      simulateNextCompletionFailure();
                      toast.message(
                        "The next completion will simulate a network failure.",
                      );
                    }}
                  >
                    <ShieldAlert />
                    Test rollback
                  </Button>
                )}
                <Link className="button button-ghost button-sm" href="/quests">
                  View all
                </Link>
              </div>
            </div>
            {isFetching && !game.quests.length ? (
              <div className="skeleton" aria-label="Loading quests" />
            ) : active.length ? (
              <div className="quest-list">
                {active.slice(0, 5).map((quest) => (
                  <QuestRow
                    key={quest.id}
                    quest={quest}
                    onComplete={() => complete.mutate(quest.id)}
                    busy={complete.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>No quests today.</strong>
                <p>
                  Your Nova Core is calm. Add a meaningful quest when you are
                  ready.
                </p>
                <Link className="button button-secondary" href="/quests/new">
                  Create quest
                </Link>
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel-head">
              <h2>Attribute constellation</h2>
              <Link href="/character" className="muted">
                Character details
              </Link>
            </div>
            <AttributeRadar attributes={game.player.attributes} />
          </section>
          <section className="panel">
            <div className="panel-head">
              <h2>Seven-day rhythm</h2>
              <span className="green">
                {game.progression.weeklyConsistency}% consistent
              </span>
            </div>
            <div
              className="week-strip"
              aria-label="Quest completion across the last seven days"
            >
              {[
                ["Mon", 60],
                ["Tue", 90],
                ["Wed", 75],
                ["Thu", 100],
                ["Fri", 55],
                ["Sat", 80],
                ["Sun", 45],
              ].map(([day, value]) => (
                <span className="day" key={day}>
                  <i
                    style={{ "--value": `${value}%` } as React.CSSProperties}
                  />
                  {day}
                </span>
              ))}
            </div>
          </section>
        </div>
        <aside className="dashboard-stack">
          <section className="panel" ref={xpTarget}>
            <div className="panel-head">
              <h2>Nova Core</h2>
              <span className="cyan">Stable</span>
            </div>
            <div
              className="core-mini"
              role="img"
              aria-label={`Nova Core at ${xpPercent(game.progression.currentXp, game.progression.nextLevelXp)} percent charge`}
            />
            <div className="level-row">
              <span>{game.progression.currentXp} XP</span>
              <strong>
                {game.progression.nextLevelXp - game.progression.currentXp} to
                level {game.progression.level + 1}
              </strong>
            </div>
            <Progress
              value={xpPercent(
                game.progression.currentXp,
                game.progression.nextLevelXp,
              )}
              label={`${game.progression.currentXp} of ${game.progression.nextLevelXp} experience points`}
            />
          </section>
          <section className="panel daily-challenge">
            <span className="eyebrow">Daily challenge</span>
            <h2>
              {game.progression.completedToday >= game.player.dailyQuestTarget
                ? "Realm fully charged"
                : `Complete ${game.player.dailyQuestTarget} quests`}
            </h2>
            <p className="muted">
              {game.progression.completedToday} of{" "}
              {game.player.dailyQuestTarget} completed. Finish the target for a
              consistency bonus.
            </p>
            <Progress
              value={Math.min(
                100,
                (game.progression.completedToday /
                  game.player.dailyQuestTarget) *
                  100,
              )}
              label={`${game.progression.completedToday} of ${game.player.dailyQuestTarget} daily quests`}
            />
          </section>
          <section className="panel">
            <div className="panel-head">
              <h2>Recent chronicle</h2>
              <Link href="/history" className="muted">
                Open
              </Link>
            </div>
            <ul className="activity-list">
              {game.activities.slice(0, 4).map((activity) => (
                <li key={activity.id}>
                  <i />
                  <span>
                    {activity.text}
                    <time>
                      {formatDistanceToNow(new Date(activity.at), {
                        addSuffix: true,
                      })}
                    </time>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
      <Dialog.Root
        open={!!levelReward}
        onOpenChange={(open) => !open && setLevelReward(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="mobile-menu" aria-describedby="level-copy">
            <Dialog.Title className="display">
              Level {levelReward?.newLevel} reached!
            </Dialog.Title>
            <p id="level-copy" className="muted">
              Your Nova Core crossed {levelReward?.levelsGained} level threshold
              {levelReward?.levelsGained === 1 ? "" : "s"}. New skill points are
              ready.
            </p>
            <Button onClick={() => setLevelReward(null)}>
              Continue adventure
            </Button>
            <Dialog.Close
              className="dialog-close"
              aria-label="Close celebration"
            >
              <X />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export function QuestRow({
  quest,
  onComplete,
  busy = false,
}: {
  quest: Quest;
  onComplete: () => void;
  busy?: boolean;
}) {
  const done = quest.status === "completed";
  return (
    <article className={`quest-card ${done ? "completed" : ""}`}>
      <button
        className="quest-check"
        onClick={onComplete}
        disabled={done || busy}
        aria-label={
          done ? `${quest.title} completed` : `Complete ${quest.title}`
        }
      >
        {done ? <Check aria-hidden="true" /> : <span aria-hidden="true" />}
      </button>
      <div>
        <h3>
          <Link href={`/quests/${quest.id}`}>{quest.title}</Link>
        </h3>
        <div className="quest-meta">
          <span>{quest.category}</span>
          <span>·</span>
          <span>{quest.difficulty}</span>
          <span>·</span>
          <span>{quest.estimatedMinutes} min</span>
          {quest.tags.map((tag) => (
            <span className="tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
        <div className="quest-actions">
          <Link href={`/quests/${quest.id}`}>Inspect</Link>
          <Link href={`/quests/${quest.id}/edit`}>Edit</Link>
        </div>
      </div>
      <div className="quest-reward">
        <strong>+{quest.xpReward} XP</strong>
        <span className="gold">+{quest.goldReward} gold</span>
      </div>
    </article>
  );
}
