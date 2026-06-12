"use client";
import dynamic from "next/dynamic";
const CreditNoteList = dynamic(
  () => import("@/features/sales/components/CreditNoteList").then((m) => m.CreditNoteList),
  { ssr: false },
);
export default function CreditNotesPage() {
  return <CreditNoteList />;
}
