"use client";

import { useState, useMemo } from "react";

import { Icon, Badge } from "@/components/ui";

import type { ComponentDef, CardTabId } from "./types";

const CARD_TABS: { id: CardTabId; label: string; icon: string }[] = [
  { id: "preview", label: "Preview", icon: "eye" },
  { id: "props", label: "Props", icon: "list" },
  { id: "css", label: "CSS", icon: "palette" },
  { id: "playground", label: "Playground", icon: "settings" },
  { id: "code", label: "Code", icon: "code" },
  { id: "api", label: "API", icon: "file-text" },
];

export function ComponentCard({ def, fullWidth = false }: { def: ComponentDef; fullWidth?: boolean }) {
  const [activeTab, setActiveTab] = useState<CardTabId>("preview");

  return (
    <div className={`border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm ${fullWidth ? "col-span-full" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-800">{def.name}</span>
          <Badge variant="secondary">{def.wraps}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400">{def.category}</span>
          <button
            onClick={() => navigator.clipboard.writeText(`import { ${def.name} } from "@/components/ui";`)}
            className="p-1 text-gray-400 hover:text-[#d95322] rounded transition-colors"
            title="Copy import"
          >
            <Icon name="copy" size={13} />
          </button>
        </div>
      </div>

      {/* 6 Sub-Tabs */}
      <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
        {CARD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-[#d95322] text-[#d95322] font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon name={tab.icon as "eye"} size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 min-h-[120px]">
        {activeTab === "preview" && <PreviewTab def={def} />}
        {activeTab === "props" && <PropsTab def={def} />}
        {activeTab === "css" && <CssTab def={def} />}
        {activeTab === "playground" && <PlaygroundTab def={def} />}
        {activeTab === "code" && <CodeTab def={def} />}
        {activeTab === "api" && <ApiTab def={def} />}
      </div>
    </div>
  );
}

// ── TAB 1: Preview ──────────────────────────────────────

function PreviewTab({ def }: { def: ComponentDef }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">{def.description}</p>
      <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50">
        {def.preview}
      </div>
    </div>
  );
}

// ── TAB 2: Props ────────────────────────────────────────

function PropsTab({ def }: { def: ComponentDef }) {
  if (def.props.length === 0) {
    return <p className="text-sm text-gray-400 italic">No custom props documented. Uses CoreUI {def.wraps} props via spread.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="py-2 px-2 font-semibold text-gray-600">Prop</th>
            <th className="py-2 px-2 font-semibold text-gray-600">Type</th>
            <th className="py-2 px-2 font-semibold text-gray-600">Default</th>
            <th className="py-2 px-2 font-semibold text-gray-600">Required</th>
            <th className="py-2 px-2 font-semibold text-gray-600">Description</th>
          </tr>
        </thead>
        <tbody>
          {def.props.map((prop) => (
            <tr key={prop.name} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-1.5 px-2">
                <code className="text-[#d95322] bg-orange-50 px-1 rounded">{prop.name}</code>
              </td>
              <td className="py-1.5 px-2">
                <code className="text-purple-600 bg-purple-50 px-1 rounded">
                  {prop.type === "enum" ? prop.enumValues?.join(" | ") : prop.type}
                </code>
              </td>
              <td className="py-1.5 px-2">
                {prop.default ? <code className="text-green-600 bg-green-50 px-1 rounded">{prop.default}</code> : <span className="text-gray-300">—</span>}
              </td>
              <td className="py-1.5 px-2">
                {prop.required ? <Badge variant="danger">req</Badge> : <span className="text-gray-300">opt</span>}
              </td>
              <td className="py-1.5 px-2 text-gray-500">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 text-[10px] text-gray-400 flex items-center gap-1">
        <Icon name="info" size={10} />
        All {def.wraps} props are forwarded via <code className="bg-gray-100 px-1 rounded">...props</code> spread.
      </div>
    </div>
  );
}

// ── TAB 3: CSS ──────────────────────────────────────────

function CssTab({ def }: { def: ComponentDef }) {
  if (def.cssTokens.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        <p className="italic mb-3">No component-specific CSS tokens. Uses global CoreUI tokens.</p>
        <div className="bg-gray-900 rounded-lg p-3">
          <pre className="text-xs text-green-400 font-mono">{`/* Override in src/styles/crm-theme.css */\n:root {\n  --st-color-primary: #d95322;\n}`}</pre>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        CSS tokens for <strong>{def.name}</strong>. Override in <code className="bg-gray-100 px-1 rounded text-[10px]">src/styles/crm-theme.css</code>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-2 px-2 font-semibold text-gray-600">CSS Token</th>
              <th className="py-2 px-2 font-semibold text-gray-600">Default</th>
              <th className="py-2 px-2 font-semibold text-gray-600">CRM Override</th>
              <th className="py-2 px-2 font-semibold text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody>
            {def.cssTokens.map((token) => (
              <tr key={token.token} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-1.5 px-2"><code className="text-blue-600 bg-blue-50 px-1 rounded text-[10px]">{token.token}</code></td>
                <td className="py-1.5 px-2">
                  <div className="flex items-center gap-1">
                    {token.defaultValue.startsWith("#") && <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: token.defaultValue }} />}
                    <code className="text-gray-500 text-[10px]">{token.defaultValue}</code>
                  </div>
                </td>
                <td className="py-1.5 px-2">
                  {token.crmOverride ? (
                    <div className="flex items-center gap-1">
                      {token.crmOverride.startsWith("#") && <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: token.crmOverride }} />}
                      <code className="text-[#d95322] bg-orange-50 px-1 rounded text-[10px]">{token.crmOverride}</code>
                    </div>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-1.5 px-2 text-gray-500">{token.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── TAB 4: Playground ───────────────────────────────────

function PlaygroundTab({ def }: { def: ComponentDef }) {
  const [state, setState] = useState<Record<string, string | boolean | number>>(() => {
    const initial: Record<string, string | boolean | number> = {};
    def.playground.forEach((p) => { initial[p.name] = p.default; });
    return initial;
  });

  const updateProp = (name: string, value: string | boolean | number) => {
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const liveCode = useMemo(() => {
    const propsStr = Object.entries(state)
      .filter(([, v]) => v !== "" && v !== false && v !== undefined)
      .map(([k, v]) => {
        if (typeof v === "boolean") return v ? k : "";
        if (typeof v === "number") return `${k}={${v}}`;
        return `${k}="${v}"`;
      })
      .filter(Boolean)
      .join(" ");
    return `<${def.name} ${propsStr} />`;
  }, [state, def.name]);

  if (def.playground.length === 0) {
    return <p className="text-sm text-gray-400 italic">No playground props configured for {def.name}.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-600">Adjust Props</h4>
        {def.playground.map((prop) => (
          <div key={prop.name} className="flex items-center gap-3">
            <label className="text-xs text-gray-500 w-24 shrink-0">{prop.label}:</label>
            {prop.type === "text" && (
              <input type="text" value={String(state[prop.name] ?? "")} onChange={(e) => updateProp(prop.name, e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]" />
            )}
            {prop.type === "select" && (
              <select value={String(state[prop.name] ?? "")} onChange={(e) => updateProp(prop.name, e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]">
                {prop.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
            {prop.type === "boolean" && (
              <input type="checkbox" checked={!!state[prop.name]} onChange={(e) => updateProp(prop.name, e.target.checked)} className="accent-[#d95322]" />
            )}
            {prop.type === "number" && (
              <input type="number" value={Number(state[prop.name] ?? 0)} onChange={(e) => updateProp(prop.name, Number(e.target.value))} className="w-20 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d95322]" />
            )}
          </div>
        ))}
        <button onClick={() => { const initial: Record<string, string | boolean | number> = {}; def.playground.forEach((p) => { initial[p.name] = p.default; }); setState(initial); }} className="text-xs text-gray-400 hover:text-[#d95322] flex items-center gap-1 mt-2">
          <Icon name="refresh" size={12} /> Reset
        </button>
      </div>
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-600">Generated Code</h4>
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500">JSX:</span>
            <button onClick={() => navigator.clipboard.writeText(liveCode)} className="text-[10px] text-gray-400 hover:text-green-400 flex items-center gap-1">
              <Icon name="copy" size={10} /> Copy
            </button>
          </div>
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{liveCode}</pre>
        </div>
      </div>
    </div>
  );
}

// ── TAB 5: Code ─────────────────────────────────────────

function CodeTab({ def }: { def: ComponentDef }) {
  const [activeExample, setActiveExample] = useState(0);

  if (def.codeExamples.length === 0) {
    return <p className="text-sm text-gray-400 italic">No code examples available.</p>;
  }

  return (
    <div>
      {def.codeExamples.length > 1 && (
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {def.codeExamples.map((ex, idx) => (
            <button key={idx} onClick={() => setActiveExample(idx)} className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${activeExample === idx ? "bg-[#d95322] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {ex.title}
            </button>
          ))}
        </div>
      )}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800">
          <span className="text-[10px] text-gray-400">{def.codeExamples[activeExample]?.title}</span>
          <button onClick={() => navigator.clipboard.writeText(def.codeExamples[activeExample]?.code || "")} className="text-[10px] text-gray-400 hover:text-green-400 flex items-center gap-1">
            <Icon name="copy" size={10} /> Copy
          </button>
        </div>
        <pre className="p-3 text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">{def.codeExamples[activeExample]?.code}</pre>
      </div>
      <div className="mt-3 bg-blue-50 rounded-lg p-2 flex items-start gap-2">
        <Icon name="info" size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-[10px] text-blue-700">
          <code>{`import { ${def.name} } from "@/components/ui";`}</code>
          <br />File: <code>{def.wrapperFile}</code> → wraps <code>{def.wraps}</code>
        </div>
      </div>
    </div>
  );
}

// ── TAB 6: API ──────────────────────────────────────────

function ApiTab({ def }: { def: ComponentDef }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div><span className="text-gray-400">Wrapper:</span> <code className="text-[#d95322]">{def.name}</code></div>
          <div><span className="text-gray-400">CoreUI:</span> <code className="text-purple-600">{def.wraps}</code></div>
          <div><span className="text-gray-400">File:</span> <code className="text-blue-600">{def.wrapperFile}</code></div>
          <div><span className="text-gray-400">Category:</span> {def.category}</div>
        </div>
      </div>

      {def.events.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <Icon name="zap" size={12} /> Events / Callbacks
          </h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-1.5 px-2 font-semibold text-gray-600">Event</th>
                <th className="py-1.5 px-2 font-semibold text-gray-600">Signature</th>
                <th className="py-1.5 px-2 font-semibold text-gray-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {def.events.map((evt) => (
                <tr key={evt.name} className="border-b border-gray-100">
                  <td className="py-1.5 px-2"><code className="text-[#d95322]">{evt.name}</code></td>
                  <td className="py-1.5 px-2"><code className="text-purple-600 text-[10px]">{evt.signature}</code></td>
                  <td className="py-1.5 px-2 text-gray-500">{evt.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {def.slots.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <Icon name="layers" size={12} /> Slots / Children
          </h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-1.5 px-2 font-semibold text-gray-600">Slot</th>
                <th className="py-1.5 px-2 font-semibold text-gray-600">Type</th>
                <th className="py-1.5 px-2 font-semibold text-gray-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {def.slots.map((slot) => (
                <tr key={slot.name} className="border-b border-gray-100">
                  <td className="py-1.5 px-2"><code className="text-blue-600">{slot.name}</code></td>
                  <td className="py-1.5 px-2"><code className="text-purple-600">{slot.type}</code></td>
                  <td className="py-1.5 px-2 text-gray-500">{slot.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {def.apiNotes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Icon name="alert-triangle" size={14} className="text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-xs text-yellow-800 whitespace-pre-wrap">{def.apiNotes}</div>
          </div>
        </div>
      )}
    </div>
  );
}
