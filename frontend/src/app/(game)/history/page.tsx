import type { Metadata } from "next";
import { HistoryView } from "@/features/history/history-view";
export const metadata:Metadata={title:"Chronicle"};
export default function Page(){return <HistoryView/>}
