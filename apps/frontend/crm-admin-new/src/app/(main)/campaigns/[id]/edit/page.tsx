import { CampaignBuilder } from "@/features/campaigns/components/CampaignBuilder";

export default function EditCampaignPage({ params }: { params: { id: string } }) {
  return <CampaignBuilder campaignId={params.id} />;
}
