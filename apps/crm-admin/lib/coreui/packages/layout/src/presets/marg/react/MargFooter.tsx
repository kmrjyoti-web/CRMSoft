// Source: Angular components/footer/footer.component.ts
import React from "react";

export const MargFooter: React.FC = () => {
  return (
    <footer className="marg-footer">
      <span>Marg Books Footer</span>
      <span style={{ opacity: 0.7, fontSize: "11px" }}>
        © 2024 Marg ERP Ltd.
      </span>
    </footer>
  );
};

MargFooter.displayName = "MargFooter";
