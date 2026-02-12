'use client';

import Card from "@/app/components/card/Card";
import { ImportStatus } from "@/lib/types/types";

export default function DashboardPage() {
  return (
    <Card status={ImportStatus.ALL} numberOfImports={100} />
  );
}
