"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Button, Badge, Icon, Input, Card } from "@/components/ui";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  useVerificationStatus,
  useSendEmailOtp,
  useVerifyEmailOtp,
  useSendMobileOtp,
  useVerifyMobileOtp,
  useSubmitGst,
} from "../hooks/useVerification";

// ── Styles ────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "20px 24px",
  marginBottom: 16,
  background: "#fff",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
  fontSize: 15,
};

const inlineInputRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 14,
  flexWrap: "wrap",
};

// ── Overall Status Badge ───────────────────────────────────

function OverallBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "warning" | "danger"> = {
    VERIFIED: "success",
    PARTIAL: "warning",
    UNVERIFIED: "danger",
  };
  return (
    <Badge variant={variantMap[status] ?? "default"}>
      {status}
    </Badge>
  );
}

// ── Email Section ─────────────────────────────────────────

function EmailSection() {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const { data: statusData } = useVerificationStatus();
  const sendOtp = useSendEmailOtp();
  const verifyOtp = useVerifyEmailOtp();

  const verified = statusData?.emailVerified ?? false;

  const handleSend = async () => {
    try {
      await sendOtp.mutateAsync(undefined);
      toast.success("OTP sent to your email");
      setShowOtp(true);
    } catch {
      toast.error("Failed to send email OTP");
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      await verifyOtp.mutateAsync({ otp });
      toast.success("Email verified successfully");
      setShowOtp(false);
      setOtp("");
    } catch {
      toast.error("Invalid OTP, please try again");
    }
  };

  return (
    <div style={sectionStyle}>
      <div style={rowStyle}>
        <div style={labelStyle}>
          <Icon name={verified ? "check-circle" : "x-circle"} size={20} />
          <span>Email Verification</span>
          <Badge variant={verified ? "success" : "danger"}>
            {verified ? "Verified" : "Unverified"}
          </Badge>
        </div>
        {!verified && !showOtp && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSend}
            disabled={sendOtp.isPending}
          >
            {sendOtp.isPending ? <LoadingSpinner size="sm" /> : <Icon name="mail" size={14} />}
            Send OTP
          </Button>
        )}
        {!verified && showOtp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowOtp(false); setOtp(""); }}
          >
            Cancel
          </Button>
        )}
      </div>

      {!verified && showOtp && (
        <div style={inlineInputRow}>
          <div style={{ width: 200 }}>
            <Input
              label="Enter OTP"
              value={otp}
              onChange={setOtp}
              leftIcon={<Icon name="key" size={16} />}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleVerify}
            disabled={verifyOtp.isPending}
          >
            {verifyOtp.isPending ? <LoadingSpinner size="sm" /> : <Icon name="check" size={14} />}
            Verify
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Mobile Section ────────────────────────────────────────

function MobileSection() {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const { data: statusData } = useVerificationStatus();
  const sendOtp = useSendMobileOtp();
  const verifyOtp = useVerifyMobileOtp();

  const verified = statusData?.mobileVerified ?? false;

  const handleSend = async () => {
    try {
      await sendOtp.mutateAsync(undefined);
      toast.success("OTP sent to your mobile");
      setShowOtp(true);
    } catch {
      toast.error("Failed to send mobile OTP");
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      await verifyOtp.mutateAsync({ otp });
      toast.success("Mobile number verified successfully");
      setShowOtp(false);
      setOtp("");
    } catch {
      toast.error("Invalid OTP, please try again");
    }
  };

  return (
    <div style={sectionStyle}>
      <div style={rowStyle}>
        <div style={labelStyle}>
          <Icon name={verified ? "check-circle" : "x-circle"} size={20} />
          <span>Mobile Verification</span>
          <Badge variant={verified ? "success" : "danger"}>
            {verified ? "Verified" : "Unverified"}
          </Badge>
        </div>
        {!verified && !showOtp && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSend}
            disabled={sendOtp.isPending}
          >
            {sendOtp.isPending ? <LoadingSpinner size="sm" /> : <Icon name="phone" size={14} />}
            Send OTP
          </Button>
        )}
        {!verified && showOtp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowOtp(false); setOtp(""); }}
          >
            Cancel
          </Button>
        )}
      </div>

      {!verified && showOtp && (
        <div style={inlineInputRow}>
          <div style={{ width: 200 }}>
            <Input
              label="Enter OTP"
              value={otp}
              onChange={setOtp}
              leftIcon={<Icon name="key" size={16} />}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleVerify}
            disabled={verifyOtp.isPending}
          >
            {verifyOtp.isPending ? <LoadingSpinner size="sm" /> : <Icon name="check" size={14} />}
            Verify
          </Button>
        </div>
      )}
    </div>
  );
}

// ── GST Section ────────────────────────────────────────────

function GstSection() {
  const { data: statusData } = useVerificationStatus();
  const submitGst = useSubmitGst();
  const [gstNumber, setGstNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");

  const gstStatus = statusData?.gstStatus;
  const gstVerified = statusData?.gstVerified ?? false;

  const statusVariant = useMemo(() => {
    if (gstStatus === "APPROVED") return "success";
    if (gstStatus === "REJECTED") return "danger";
    if (gstStatus === "PENDING") return "warning";
    return "default";
  }, [gstStatus]);

  const handleSubmit = async () => {
    if (!gstNumber.trim() || !businessName.trim()) {
      toast.error("GST Number and Business Name are required");
      return;
    }
    try {
      await submitGst.mutateAsync({ gstNumber, businessName, address: address || undefined });
      toast.success("GST details submitted for approval");
    } catch {
      toast.error("Failed to submit GST details");
    }
  };

  const showForm = !gstVerified && gstStatus !== "PENDING";

  return (
    <div style={sectionStyle}>
      <div style={rowStyle}>
        <div style={labelStyle}>
          <Icon name={gstVerified ? "check-circle" : "file-text"} size={20} />
          <span>GST Verification</span>
          {gstStatus ? (
            <Badge variant={statusVariant}>{gstStatus}</Badge>
          ) : (
            <Badge variant="default">Not Submitted</Badge>
          )}
        </div>
        {gstStatus === "PENDING" && (
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Under review by admin
          </span>
        )}
      </div>

      {gstStatus === "REJECTED" && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", borderRadius: 6, color: "#dc2626", fontSize: 13 }}>
          Your GST was rejected. Please re-submit with correct details.
        </div>
      )}

      {showForm && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
          <Input
            label="GST Number"
            value={gstNumber}
            onChange={setGstNumber}
            leftIcon={<Icon name="hash" size={16} />}
          />
          <Input
            label="Business Name"
            value={businessName}
            onChange={setBusinessName}
            leftIcon={<Icon name="briefcase" size={16} />}
          />
          <Input
            label="Address (optional)"
            value={address}
            onChange={setAddress}
            leftIcon={<Icon name="map-pin" size={16} />}
          />
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitGst.isPending}
            >
              {submitGst.isPending ? <LoadingSpinner size="sm" /> : <Icon name="send" size={14} />}
              Submit for Approval
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function VerificationPanel() {
  const { data: statusData, isLoading } = useVerificationStatus();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const overallStatus = statusData?.overallStatus ?? "UNVERIFIED";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <Icon name="shield" size={24} />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Account Verification</h2>
          <OverallBadge status={overallStatus} />
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Complete all verifications to unlock full access to your CRM account.
        </p>
      </div>

      {/* Sections */}
      <EmailSection />
      <MobileSection />
      <GstSection />
    </div>
  );
}
