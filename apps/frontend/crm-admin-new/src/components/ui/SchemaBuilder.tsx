'use client';

import { AICSchemaBuilder, AICFieldEditor } from '@coreui/ui-react';

type SchemaBuilderProps = React.ComponentProps<typeof AICSchemaBuilder>;
type FieldEditorProps = React.ComponentProps<typeof AICFieldEditor>;

export function SchemaBuilder(props: SchemaBuilderProps) {
  return <AICSchemaBuilder {...props} />;
}

export function FieldEditor(props: FieldEditorProps) {
  return <AICFieldEditor {...props} />;
}
