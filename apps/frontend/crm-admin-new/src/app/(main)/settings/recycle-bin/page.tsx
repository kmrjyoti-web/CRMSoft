import { PageHeader } from "@/components/common/PageHeader";

import { RecycleBinList } from "@/features/recycle-bin/components/RecycleBinList";

export default function RecycleBinPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6">
        <PageHeader title="Recycle Bin" />
      </div>
      <div className="flex-1 min-h-0">
        <RecycleBinList />
      </div>
    </div>
  );
}
