"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Filter, LayoutGrid, List, Search, X } from "lucide-react";
import Link from "next/link";
import { flushSync } from "react-dom";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuestRow } from "@/features/dashboard/dashboard-view";
import { useCompleteQuest } from "@/features/quests/use-complete-quest";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Flip } from "@/lib/gsap/register";
import { gameQueryKey, useGameQuery } from "@/lib/query/game-query";
import { mockGameService, mockQuestService } from "@/services/mock/game-service";
import { ATTRIBUTES, type Difficulty, type Quest, type QuestStatus } from "@/types/domain";

type DueFilter = "All" | "Today" | "This week" | "Overdue";
type SortKey = "dueAt" | "difficulty" | "xp" | "title";
const difficulties: Difficulty[] = ["Easy", "Standard", "Challenging", "Epic"];
const difficultyRank: Record<Difficulty, number> = { Easy: 1, Standard: 2, Challenging: 3, Epic: 4 };
const filterReferenceTime = Date.now();

function visualStatus(quest: Quest): QuestStatus { return quest.status === "active" && Date.parse(quest.dueAt) < filterReferenceTime ? "overdue" : quest.status; }

export function QuestListView() {
  const { data: game } = useGameQuery();
  const client = useQueryClient();
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState(""); const [status, setStatus] = useState<QuestStatus | "All">("All"); const [attribute, setAttribute] = useState<(typeof ATTRIBUTES)[number] | "All">("All"); const [difficulty, setDifficulty] = useState<Difficulty | "All">("All"); const [due, setDue] = useState<DueFilter>("All"); const [sort, setSort] = useState<SortKey>("dueAt"); const [view, setView] = useState<"list" | "board">("list");
  const changeWithFlip = (change: () => void) => { if (!container.current || reducedMotion) { change(); return; } const state = Flip.getState(container.current.children); flushSync(change); Flip.from(state, { duration: .28, ease: "power2.out", absolute: false }); };
  const filtered = useMemo(() => {
    const now = new Date(filterReferenceTime); const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime(); const endOfWeek = filterReferenceTime + 7 * 86_400_000;
    return [...game.quests].filter((quest) => quest.title.toLowerCase().includes(query.toLowerCase()) && (status === "All" || visualStatus(quest) === status) && (attribute === "All" || quest.category === attribute) && (difficulty === "All" || quest.difficulty === difficulty) && (due === "All" || (due === "Today" && Date.parse(quest.dueAt) < endOfToday && Date.parse(quest.dueAt) >= startOfToday) || (due === "This week" && Date.parse(quest.dueAt) <= endOfWeek && Date.parse(quest.dueAt) >= filterReferenceTime) || (due === "Overdue" && visualStatus(quest) === "overdue"))).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "difficulty" ? difficultyRank[b.difficulty] - difficultyRank[a.difficulty] : sort === "xp" ? b.xpReward - a.xpReward : Date.parse(a.dueAt) - Date.parse(b.dueAt));
  }, [game.quests, query, status, attribute, difficulty, due, sort]);
  const complete = useCompleteQuest();
  const duplicate = useMutation({ mutationFn: (id: string) => mockQuestService.duplicate(id), onSuccess: async (quest) => { client.setQueryData(gameQueryKey, await mockGameService.getSnapshot()); toast.success(`Duplicated as “${quest.title}”.`); }, onError: (error) => toast.error(error instanceof Error ? error.message : "Could not duplicate quest.") });
  const clear = () => changeWithFlip(() => { setQuery(""); setStatus("All"); setAttribute("All"); setDifficulty("All"); setDue("All"); setSort("dueAt"); });
  const filters = <FilterControls status={status} setStatus={(value) => changeWithFlip(() => setStatus(value))} attribute={attribute} setAttribute={(value) => changeWithFlip(() => setAttribute(value))} difficulty={difficulty} setDifficulty={(value) => changeWithFlip(() => setDifficulty(value))} due={due} setDue={(value) => changeWithFlip(() => setDue(value))} sort={sort} setSort={(value) => changeWithFlip(() => setSort(value))} clear={clear}/>;

  return <><div className="page-head"><div><span className="eyebrow">Quest archive</span><h1>Choose your next move.</h1><p>Create, complete, edit, and organize the actions that build your character.</p></div><Link href="/quests/new" className="button button-primary">Create quest</Link></div><div className="toolbar"><label className="sr-only" htmlFor="quest-search">Search quests</label><div className="search-field"><Search/><input id="quest-search" placeholder="Search quests…" value={query} onChange={(event) => changeWithFlip(() => setQuery(event.target.value))}/></div><div className="quest-filters desktop-filter-controls">{filters}</div><Dialog.Root><Dialog.Trigger asChild><Button className="mobile-filter-trigger" variant="secondary"><Filter/>Filters</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="mobile-menu filter-drawer"><Dialog.Title>Filter quests</Dialog.Title>{filters}<Dialog.Close className="dialog-close" aria-label="Close filters"><X/></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root><Button variant="secondary" size="icon" aria-label={view === "list" ? "Switch to board view" : "Switch to list view"} onClick={() => setView((value) => value === "list" ? "board" : "list")}>{view === "list" ? <LayoutGrid/> : <List/>}</Button></div>
    <p className="filter-results">{filtered.length} quest{filtered.length === 1 ? "" : "s"} · sorted by {sort === "dueAt" ? "due date" : sort === "xp" ? "XP" : sort}</p>
    <div ref={container}>{filtered.length === 0 ? <div className="panel empty-state"><Search/><strong>No quests match these filters.</strong><p>Clear filters or create a new quest.</p><Button variant="secondary" onClick={clear}>Clear filters</Button></div> : view === "list" ? <div className="quest-grid">{filtered.map((quest) => <div key={quest.id} className="panel"><QuestRow quest={{ ...quest, status: visualStatus(quest) }} onComplete={() => complete.mutate(quest.id)} busy={complete.isPending}/><div className="card-actions"><Link className="button button-ghost button-sm" href={`/quests/${quest.id}`}>Inspect</Link><Button variant="ghost" size="sm" onClick={() => duplicate.mutate(quest.id)} disabled={duplicate.isPending}><Copy/>Duplicate</Button></div></div>)}</div> : <div className="quest-grid board">{(["active", "completed", "overdue"] as QuestStatus[]).map((column) => <section className="board-column" key={column}><h2>{column[0].toUpperCase() + column.slice(1)} · {filtered.filter((quest) => visualStatus(quest) === column).length}</h2>{filtered.filter((quest) => visualStatus(quest) === column).map((quest) => <QuestRow key={quest.id} quest={{ ...quest, status: visualStatus(quest) }} onComplete={() => complete.mutate(quest.id)} busy={complete.isPending}/>)}</section>)}</div>}</div>
  </>;
}

function FilterControls({ status, setStatus, attribute, setAttribute, difficulty, setDifficulty, due, setDue, sort, setSort, clear }: { status: QuestStatus | "All"; setStatus: (value: QuestStatus | "All") => void; attribute: (typeof ATTRIBUTES)[number] | "All"; setAttribute: (value: (typeof ATTRIBUTES)[number] | "All") => void; difficulty: Difficulty | "All"; setDifficulty: (value: Difficulty | "All") => void; due: DueFilter; setDue: (value: DueFilter) => void; sort: SortKey; setSort: (value: SortKey) => void; clear: () => void }) {
  return <><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as QuestStatus | "All")}><option>All</option><option value="active">Active</option><option value="completed">Completed</option><option value="overdue">Overdue</option></select></label><label><span>Attribute</span><select value={attribute} onChange={(event) => setAttribute(event.target.value as typeof attribute)}><option>All</option>{ATTRIBUTES.map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | "All")}><option>All</option>{difficulties.map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Due</span><select value={due} onChange={(event) => setDue(event.target.value as DueFilter)}><option>All</option><option>Today</option><option>This week</option><option>Overdue</option></select></label><label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="dueAt">Due date</option><option value="difficulty">Difficulty</option><option value="xp">XP</option><option value="title">Title</option></select></label><Button variant="ghost" size="sm" onClick={clear}>Clear</Button></>;
}
