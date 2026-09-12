import { QuestRoute } from "@/features/quests/quest-route";
export default async function QuestDetailPage({params}:{params:Promise<{questId:string}>}){return <QuestRoute id={(await params).questId}/>}
