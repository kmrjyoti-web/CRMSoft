"use client";
import dynamic from "next/dynamic";
const DebitNoteList = dynamic(
  () => import("@/features/sales/components/DebitNoteList").then((m) => m.DebitNoteList),
  { ssr: false },
);
export default function DebitNoteDetailPage() {
  return <DebitNoteList />;
}
