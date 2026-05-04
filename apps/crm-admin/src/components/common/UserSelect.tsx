"use client";

import { useMemo, useCallback } from "react";

import { SelectInput, Icon } from "@/components/ui";

import { useUsersList } from "@/features/settings/hooks/useUsers";

interface UserSelectProps {
  value?: string | null;
  onChange?: (value: string | number | boolean | null) => void;
  onUserSelected?: (user: { id: string; firstName: string; lastName: string; email: string }) => void;
  label?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  /** Filter users to only show active ones (default true) */
  activeOnly?: boolean;
}

export function UserSelect({
  value,
  onChange,
  onUserSelected,
  label = "User",
  error,
  errorMessage,
  disabled,
  required,
  leftIcon,
  activeOnly = true,
}: UserSelectProps) {
  const { data, isLoading } = useUsersList({ isActive: activeOnly ? true : undefined });

  const userList = useMemo(() => {
    const raw = data?.data;
    const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
    return list as { id: string; firstName: string; lastName: string; email: string; isActive?: boolean }[];
  }, [data]);

  const options = useMemo(() => {
    return userList.map((u) => ({
      label: `${u.firstName} ${u.lastName}`,
      value: u.id,
    }));
  }, [userList]);

  const handleChange = useCallback(
    (val: string | number | boolean | null) => {
      onChange?.(val);
      if (onUserSelected && val) {
        const user = userList.find((u) => u.id === val);
        if (user) onUserSelected(user);
      }
    },
    [onChange, onUserSelected, userList],
  );

  return (
    <SelectInput
      options={options}
      value={value}
      onChange={handleChange}
      placeholder="Select user..."
      label={label}
      loading={isLoading}
      error={error}
      errorMessage={errorMessage}
      disabled={disabled}
      required={required}
      leftIcon={leftIcon ?? <Icon name="user" size={16} />}
      searchable
      clearable
    />
  );
}
