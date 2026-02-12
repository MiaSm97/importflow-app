import { ALLOWED_EXTENSIONS_BY_TYPE } from "./types/types";

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
