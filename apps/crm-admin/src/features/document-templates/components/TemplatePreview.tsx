"use client";

import { useRef, useEffect } from "react";

interface TemplatePreviewProps {
  html: string;
  className?: string;
}

export function TemplatePreview({ html, className }: TemplatePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="Template Preview"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 600,
        border: "1px solid var(--border-color, #dee2e6)",
        borderRadius: 6,
        background: "#fff",
      }}
      sandbox="allow-same-origin allow-scripts"
    />
  );
}
