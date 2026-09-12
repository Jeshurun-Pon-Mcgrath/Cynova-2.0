import { QuestEditor } from "@/features/quests/quest-editor";
export default async function EditQuestPage({ params }: { params: Promise<{ questId: string }> }) { return <QuestEditor id={(await params).questId}/>; }
