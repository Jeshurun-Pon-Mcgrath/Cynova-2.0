import type { Metadata } from "next";
import { QuestListView } from "@/features/quests/quest-list-view";
export const metadata:Metadata={title:"Quests"};
export default function QuestsPage(){return <QuestListView/>}
