import { PublicVerifyPage } from "@/features/entity-verification/components/PublicVerifyPage";

export default function VerifyPage({
  params,
}: {
  params: { token: string };
}) {
  return <PublicVerifyPage token={params.token} />;
}
