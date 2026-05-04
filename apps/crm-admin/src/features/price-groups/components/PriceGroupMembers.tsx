"use client";

import { useState, useMemo } from "react";

import toast from "react-hot-toast";

import { Button, Card, Badge, Icon, Input, SelectInput } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import {
  usePriceGroupMembers,
  useAddPriceGroupMembers,
  useRemovePriceGroupMember,
} from "../hooks/usePriceGroups";
import type { PriceGroupMember } from "../types/price-groups.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PriceGroupMembersProps {
  groupId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceGroupMembers({ groupId }: PriceGroupMembersProps) {
  const { data, isLoading } = usePriceGroupMembers(groupId);
  const addMut = useAddPriceGroupMembers();
  const removeMut = useRemovePriceGroupMember();

  const [memberType, setMemberType] = useState<"CONTACT" | "ORGANIZATION">("CONTACT");
  const [searchTerm, setSearchTerm] = useState("");
  const [memberIds, setMemberIds] = useState("");

  const members: PriceGroupMember[] = useMemo(() => {
    const raw = data?.data ?? data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  // ── Handlers ────────────────────────────────────────────
  function handleAddMembers() {
    const ids = memberIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      toast.error("Enter at least one member ID");
      return;
    }
    addMut.mutate(
      { id: groupId, dto: { memberType, memberIds: ids } },
      {
        onSuccess: () => {
          toast.success("Members added");
          setMemberIds("");
        },
        onError: () => toast.error("Failed to add members"),
      }
    );
  }

  function handleRemove(member: PriceGroupMember) {
    if (!confirm(`Remove "${member.memberName}" from this group?`)) return;
    removeMut.mutate(
      { id: groupId, mappingId: member.id },
      {
        onSuccess: () => toast.success("Member removed"),
        onError: () => toast.error("Failed to remove member"),
      }
    );
  }

  // ── Filter ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchTerm) return members;
    const q = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.memberName.toLowerCase().includes(q) ||
        (m.memberEmail && m.memberEmail.toLowerCase().includes(q))
    );
  }, [members, searchTerm]);

  // ── Render ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600 }}>Group Members</h3>

      {/* Add Members Section */}
      <Card>
        <div style={{ padding: "16px" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 600 }}>Add Members</h4>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ width: "180px" }}>
              <SelectInput
                label="Member Type"
                value={memberType}
                onChange={(v) => setMemberType(v as "CONTACT" | "ORGANIZATION")}
                options={[
                  { label: "Contact", value: "CONTACT" },
                  { label: "Organization", value: "ORGANIZATION" },
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <Input
                label="Member IDs (comma separated)"
                leftIcon={<Icon name="users" size={16} />}
                value={memberIds}
                onChange={(v: string) => setMemberIds(v)}
              />
            </div>
            <Button variant="primary" onClick={handleAddMembers} disabled={addMut.isPending}>
              {addMut.isPending ? <LoadingSpinner /> : <><Icon name="plus" size={16} /> Add</>}
            </Button>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div style={{ margin: "16px 0" }}>
        <Input
          label="Search members"
          leftIcon={<Icon name="search" size={16} />}
          value={searchTerm}
          onChange={(v: string) => setSearchTerm(v)}
        />
      </div>

      {/* Members Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Type</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Added Date</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                    No members found
                  </td>
                </tr>
              )}
              {filtered.map((member) => (
                <tr key={member.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{member.memberName}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{member.memberEmail || "\u2014"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={member.memberType === "CONTACT" ? "primary" : "secondary"}>
                      {member.memberType}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                    {new Date(member.addedAt).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Button
                      variant="danger"
                      onClick={() => handleRemove(member)}
                      disabled={removeMut.isPending}
                    >
                      <Icon name="trash-2" size={16} /> Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
