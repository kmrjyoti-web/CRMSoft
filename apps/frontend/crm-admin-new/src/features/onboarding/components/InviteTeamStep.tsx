"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { Input, Button, Typography, Icon } from "@/components/ui";

import { onboardingService } from "../services/onboarding.service";

interface TeamMember {
  email: string;
  firstName: string;
  lastName: string;
}

interface InviteTeamStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function InviteTeamStep({ onComplete, onSkip }: InviteTeamStepProps) {
  const [members, setMembers] = useState<TeamMember[]>([
    { email: "", firstName: "", lastName: "" },
  ]);
  const [sending, setSending] = useState(false);

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addRow = () => {
    if (members.length < 10) {
      setMembers((prev) => [...prev, { email: "", firstName: "", lastName: "" }]);
    }
  };

  const removeRow = (index: number) => {
    if (members.length > 1) {
      setMembers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleInvite = async () => {
    const validMembers = members.filter((m) => m.email && m.firstName && m.lastName);
    if (validMembers.length === 0) {
      toast.error("Please add at least one team member");
      return;
    }

    setSending(true);
    let successCount = 0;

    for (const member of validMembers) {
      try {
        await onboardingService.inviteUser({
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          roleId: "", // Will use default role
          password: "Welcome@123", // Temporary password
        });
        successCount++;
      } catch {
        toast.error(`Failed to invite ${member.email}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} team member(s) invited`);
    }
    setSending(false);
    onComplete();
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div
          className="mx-auto mb-3 flex items-center justify-center"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg, 12px)",
            background: "var(--color-primary-light, rgba(59,130,246,0.1))",
          }}
        >
          <Icon name="users" size={24} />
        </div>
        <Typography variant="heading" level={4}>
          Invite Your Team
        </Typography>
        <Typography variant="text" color="muted" size="14px">
          Add team members to get started together
        </Typography>
      </div>

      <div className="space-y-3">
        {members.map((member, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.5fr auto",
              gap: "8px",
              alignItems: "start",
            }}
          >
            <Input
              placeholder="First Name"
              value={member.firstName}
              onChange={(val: string) => updateMember(index, "firstName", val)}
              leftIcon={<Icon name="user" size={14} />}
            />
            <Input
              placeholder="Last Name"
              value={member.lastName}
              onChange={(val: string) => updateMember(index, "lastName", val)}
              leftIcon={<Icon name="user" size={14} />}
            />
            <Input
              type="email"
              placeholder="Email"
              value={member.email}
              onChange={(val: string) => updateMember(index, "email", val)}
              leftIcon={<Icon name="mail" size={14} />}
            />
            {members.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(index)}
                style={{ marginTop: "4px" }}
              >
                <Icon name="x" size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>

      {members.length < 10 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="mt-3"
        >
          <Icon name="plus" size={14} />
          Add another member
        </Button>
      )}

      <Typography variant="text" color="muted" size="12px" className="mt-3">
        Team members will receive a temporary password (Welcome@123) and can change it on first login.
      </Typography>

      <div className="mt-6 flex justify-between">
        <Button type="button" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleInvite}
          loading={sending}
          disabled={sending}
        >
          Invite & Continue
          <Icon name="arrow-right" size={16} />
        </Button>
      </div>
    </div>
  );
}
