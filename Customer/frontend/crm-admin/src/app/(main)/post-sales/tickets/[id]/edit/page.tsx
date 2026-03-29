"use client";

import { use } from "react";
import { TicketForm } from "@/features/post-sales/components/TicketForm";

export default function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TicketForm ticketId={id} />;
}
