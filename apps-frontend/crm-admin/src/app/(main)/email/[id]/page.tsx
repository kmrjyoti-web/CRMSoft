import { EmailDetail } from "@/features/email/components/EmailDetail";

export default function EmailDetailPage({ params }: { params: { id: string } }) {
  return <EmailDetail emailId={params.id} />;
}
