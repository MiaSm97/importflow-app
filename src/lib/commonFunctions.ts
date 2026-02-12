import { ALLOWED_EXTENSIONS_BY_TYPE, Import } from "./types/types";

export const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

export const isFileTypeValid = (file: File, type: string) => {
  const fileExtension = getFileExtension(file.name);
  const allowedExtensions = ALLOWED_EXTENSIONS_BY_TYPE[type];
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

export const handleExportImports = (imports: Import[]) => {
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
