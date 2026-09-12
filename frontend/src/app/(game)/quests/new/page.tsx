import type { Metadata } from "next";
import { QuestForm } from "@/features/quests/quest-form";
export const metadata:Metadata={title:"Create quest"};
export default function NewQuestPage(){return <><div className="page-head"><div><span className="eyebrow">Quest forge</span><h1>Define the next victory.</h1><p>Make it clear, finishable, and worth showing up for.</p></div></div><QuestForm/></>}
