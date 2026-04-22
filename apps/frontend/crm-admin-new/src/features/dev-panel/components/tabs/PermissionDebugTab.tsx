"use client";

import { useState, useMemo } from "react";

import { Icon, Badge, Input } from "@/components/ui";

import { useAuthStore } from "@/stores/auth.store";
import { usePermissionStore } from "@/stores/permission.store";

const ACTIONS = ["view", "create", "edit", "delete", "manage"];

export function PermissionDebugTab() {
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const codes = usePermissionStore((s) => s.codes);
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const [search, setSearch] = useState("");
  const [testCode, setTestCode] = useState("");

  // Extract modules from permission codes (e.g., "contacts:view" → "contacts")
  const modules = useMemo(() => {
    const moduleSet = new Set<string>();
    codes.forEach((code) => {
      const parts = code.split(/[:.]/);
      if (parts.length >= 1) moduleSet.add(parts[0]);
    });
    return Array.from(moduleSet).sort();
  }, [codes]);

  const filteredModules = useMemo(() => {
    if (!search) return modules;
    return modules.filter((m) => m.toLowerCase().includes(search.toLowerCase()));
  }, [modules, search]);

  const checkPermission = (module: string, action: string): boolean | null => {
    // Check common patterns: module:action, module.action
    if (hasPermission(`${module}:${action}`)) return true;
    if (hasPermission(`${module}.${action}`)) return true;
    // Check if any code contains this module+action
    const exists = codes.some(
      (c) => c.startsWith(`${module}:`) || c.startsWith(`${module}.`),
    );
    if (!exists) return null; // module has no actions of this type
    return false;
  };

  return (
    <div className="space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
          {user?.firstName?.charAt(0) ?? "?"}
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
          </div>
          <div className="text-sm text-gray-500">
            Roles: {roles.length > 0 ? roles.join(", ") : "None"} | Permissions: {codes.length}
          </div>
        </div>
      </div>

      {/* Test Permission */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Test permission code (e.g., contacts:view)"
            value={testCode}
            onChange={(v) => setTestCode(v)}
            leftIcon={<Icon name="search" size={16} />}
          />
        </div>
        {testCode && (
          <Badge variant={hasPermission(testCode) ? "success" : "danger"}>
            {hasPermission(testCode) ? "GRANTED" : "DENIED"}
          </Badge>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Filter modules..."
        value={search}
        onChange={(v) => setSearch(v)}
        leftIcon={<Icon name="filter" size={16} />}
      />

      {/* Permission Matrix */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Module</th>
              {ACTIONS.map((action) => (
                <th key={action} className="text-center px-3 py-2 font-semibold text-gray-700 capitalize">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredModules.map((module) => (
              <tr key={module} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{module}</td>
                {ACTIONS.map((action) => {
                  const result = checkPermission(module, action);
                  return (
                    <td key={action} className="text-center px-3 py-2">
                      {result === true && <Icon name="check-circle" size={18} className="text-green-500 inline" />}
                      {result === false && <Icon name="x-circle" size={18} className="text-red-400 inline" />}
                      {result === null && <span className="text-gray-300">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Raw Permissions */}
      <details className="border border-gray-200 rounded-lg">
        <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
          Raw Permission Codes ({codes.length})
        </summary>
        <div className="px-4 py-3 border-t border-gray-200">
          <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {JSON.stringify(codes, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
