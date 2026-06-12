"use client";

interface PageSkeletonProps {
  variant?: "dashboard" | "table" | "form" | "detail";
}

export function PageSkeleton({ variant = "table" }: PageSkeletonProps) {
  const shimmer = { animation: "pulse 1.5s ease-in-out infinite", background: "#e5e7eb", borderRadius: "6px" };

  if (variant === "dashboard") {
    return (
      <div style={{ padding: "24px" }}>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{ ...shimmer, height: "12px", width: "80px", marginBottom: "8px" }} />
              <div style={{ ...shimmer, height: "28px", width: "60px" }} />
            </div>
          ))}
        </div>
        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{ ...shimmer, height: "16px", width: "120px", marginBottom: "16px" }} />
              <div style={{ ...shimmer, height: "200px", width: "100%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div style={{ padding: "24px", maxWidth: "640px" }}>
        <div style={{ ...shimmer, height: "24px", width: "200px", marginBottom: "24px" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ marginBottom: "20px" }}>
            <div style={{ ...shimmer, height: "12px", width: "100px", marginBottom: "8px" }} />
            <div style={{ ...shimmer, height: "40px", width: "100%" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <div style={{ ...shimmer, height: "40px", width: "100px" }} />
          <div style={{ ...shimmer, height: "40px", width: "100px" }} />
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div style={{ ...shimmer, height: "64px", width: "64px", borderRadius: "50%" }} />
          <div>
            <div style={{ ...shimmer, height: "20px", width: "200px", marginBottom: "8px" }} />
            <div style={{ ...shimmer, height: "14px", width: "150px" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{ ...shimmer, height: "12px", width: "80px", marginBottom: "8px" }} />
              <div style={{ ...shimmer, height: "16px", width: "120px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: table variant - delegate to existing TableSkeleton
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ ...shimmer, height: "24px", width: "160px" }} />
        <div style={{ ...shimmer, height: "36px", width: "120px" }} />
      </div>
      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: "16px", padding: "12px 16px", borderBottom: "2px solid #e5e7eb" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ ...shimmer, height: "14px", flex: 1 }} />
          ))}
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
          <div key={row} style={{ display: "flex", gap: "16px", padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
            {[1, 2, 3, 4, 5].map((col) => (
              <div key={col} style={{ ...shimmer, height: "14px", flex: 1, width: `${40 + ((row + col) % 4) * 15}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
