"use client";

import { useRouter } from "next/navigation";

import { Button, Typography, Icon } from "@/components/ui";

interface CompletionStepProps {
  onComplete: () => void;
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  const router = useRouter();

  const handleFinish = async () => {
    await onComplete();
    router.push("/dashboard");
  };

  return (
    <div className="text-center py-8">
      {/* Success Animation */}
      <div
        className="mx-auto mb-4 flex items-center justify-center"
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          animation: "pulse 2s infinite",
        }}
      >
        <Icon name="check" size={40} />
      </div>

      <Typography variant="heading" level={3} className="mb-2">
        You&apos;re All Set!
      </Typography>
      <Typography variant="text" color="muted" className="mb-6" size="15px">
        Your CRM workspace is ready. Start managing your contacts, leads, and sales pipeline.
      </Typography>

      {/* Quick Start Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "16px 12px",
            textAlign: "center",
          }}
        >
          <Icon name="users" size={24} />
          <Typography variant="text" size="13px" className="mt-2">
            Add Contacts
          </Typography>
        </div>
        <div
          style={{
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "16px 12px",
            textAlign: "center",
          }}
        >
          <Icon name="trending-up" size={24} />
          <Typography variant="text" size="13px" className="mt-2">
            Create Leads
          </Typography>
        </div>
        <div
          style={{
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "16px 12px",
            textAlign: "center",
          }}
        >
          <Icon name="bar-chart" size={24} />
          <Typography variant="text" size="13px" className="mt-2">
            View Reports
          </Typography>
        </div>
      </div>

      <Button type="button" variant="primary" onClick={handleFinish}>
        Go to Dashboard
        <Icon name="arrow-right" size={16} />
      </Button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
