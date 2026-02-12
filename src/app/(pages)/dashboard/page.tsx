'use client';

import Card from "@/app/components/card/Card";
import DashboardEmpty from "@/app/components/empty-states/DashboardEmpty";
import ImportsTable from "@/app/components/imports-table/ImportsTable";
import WarmingBanner from "@/app/components/warning/WarningBanner";
import { handleExportImports } from "@/lib/commonFunctions";
import { useMenu } from "@/lib/context/MenuContext";
import { ImportStatus } from "@/lib/types/types";

export default function DashboardPage() {
  const { imports, importsLoaded } = useMenu();

  const pendingImports = imports.filter(
    (item) => item.status === ImportStatus.PENDING
  ).length;
  const failedImports = imports.filter(
    (item) => item.status === ImportStatus.FAILED
  ).length;
  const completedImports = imports.filter(
    (item) => item.status === ImportStatus.COMPLETED
  ).length;
  const latestImports = [...imports]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  if (!importsLoaded) {
    return null;
  }

  if (imports.length === 0) {
    return <DashboardEmpty />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card status={ImportStatus.ALL} numberOfImports={imports.length} />
        <Card status={ImportStatus.PENDING} numberOfImports={pendingImports} />
        <Card status={ImportStatus.FAILED} numberOfImports={failedImports} />
        <Card
          status={ImportStatus.COMPLETED}
          numberOfImports={completedImports}
        />
      </div>
      <ImportsTable onExport={() => handleExportImports(latestImports)} imports={latestImports} />
      {failedImports > 0 && <WarmingBanner />}
    </div>
  );
}
