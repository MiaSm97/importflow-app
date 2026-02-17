import { deleteImport } from "./data/importsRepository";
import {
  ALLOWED_EXTENSIONS_BY_TYPE,
  DeleteImport,
  Import,
  ImportStatus,
} from "./types/types";

export const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

export const isFileTypeValid = (file: File, type: string) => {
  const fileExtension = getFileExtension(file.name);
  const allowedExtensions =
    ALLOWED_EXTENSIONS_BY_TYPE[type as keyof typeof ALLOWED_EXTENSIONS_BY_TYPE];
  if (!allowedExtensions) {
    return false;
  }
  return allowedExtensions.includes(fileExtension);
};

export const getColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#D1FAE5";
    case "pending":
      return "#FEF3C7";
    case "failed":
      return "#FEE2E2";
    default:
      return "transparent";
  }
};

export const getColorImportStatus = (status: ImportStatus) => {
  switch (status) {
    case ImportStatus.COMPLETED:
      return "#10B981";
    case ImportStatus.FAILED:
      return "#F87171";
    case ImportStatus.PENDING:
      return "#FBBF24";
    default:
      return "#D1D5DB";
  }
};

export const handleExportImports = (imports: Import[]) => {
  // RFC4180-safe escaping: wrap every field and double any inner quotes.
  const escapeCsv = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  const headers = [
    "id",
    "name",
    "type",
    "status",
    "progress",
    "createdAt",
    "updatedAt",
  ];
  const rows = imports.map((item) =>
    [
      escapeCsv(item.id),
      escapeCsv(item.name),
      escapeCsv(item.type),
      escapeCsv(item.status),
      escapeCsv(item.progress ?? 100),
      escapeCsv(item.createdAt),
      escapeCsv(item.updatedAt),
    ].join(","),
  );

  // Build and trigger a client-side CSV download without server roundtrip.
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `imports-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatDateToSeconds = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const executeDeleteImport = async ({
  importId,
  showLoader,
  hideLoader,
  removeImport,
  onSuccess,
  onError,
}: DeleteImport) => {
  showLoader();
  try {
    await deleteImport(importId);
    removeImport(importId);
    onSuccess?.();
  } catch {
    onError?.();
  } finally {
    hideLoader();
  }
};
