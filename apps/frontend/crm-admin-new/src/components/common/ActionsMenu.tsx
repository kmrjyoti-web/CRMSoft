"use client";

import { useState, useRef, useEffect } from "react";

import { Button, Icon } from "@/components/ui";

export interface ActionMenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "danger";
  disabled?: boolean;
}

interface ActionsMenuProps {
  items: ActionMenuItem[];
}

export function ActionsMenu({ items }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-label="More actions"
      >
        <Icon name="more-horizontal" size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              disabled={item.disabled}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors
                ${item.disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}
                ${item.variant === "danger" ? "text-red-600" : "text-gray-700"}`}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
