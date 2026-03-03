export type PropType = "string" | "number" | "boolean" | "enum" | "ReactNode" | "function" | "object" | "array";

export interface PropDef {
  name: string;
  type: PropType;
  required: boolean;
  default?: string;
  description: string;
  enumValues?: string[];
}

export interface CssTokenDef {
  token: string;
  description: string;
  defaultValue: string;
  crmOverride?: string;
}

export interface EventDef {
  name: string;
  signature: string;
  description: string;
}

export interface SlotDef {
  name: string;
  type: string;
  description: string;
}

export interface CodeExample {
  title: string;
  code: string;
}

export interface PlaygroundProp {
  name: string;
  type: "text" | "select" | "boolean" | "number" | "color";
  default: string | boolean | number;
  options?: string[];
  label: string;
}

export interface ComponentDef {
  name: string;
  wraps: string;
  wrapperFile: string;
  category: string;
  description: string;
  defaultProps?: string;

  preview: React.ReactNode;
  props: PropDef[];
  cssTokens: CssTokenDef[];
  events: EventDef[];
  slots: SlotDef[];
  codeExamples: CodeExample[];
  playground: PlaygroundProp[];
  apiNotes?: string;
}

export type CardTabId = "preview" | "props" | "css" | "playground" | "code" | "api";
