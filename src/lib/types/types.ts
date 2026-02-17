export type MenuOptions = {
  title?: string;
  backButtonUrl?: string;
  tabs?: { label: Sections; onClick: () => void; selected: boolean }[];
  customButtons?: { label: string; onClick: () => void; primary: boolean }[];
  search?: { text: string; onChangeSearch: (text: string) => void };
  subMenu?: Option[];
};

export type Option = {
  label: string;
  onClick: () => void;
  hidden?: boolean;
};

export enum Sections {
  DASHBOARD = "dashboard.title",
  IMPORTS = "imports.title",
  DETAIL = "detail.title",
}

export enum ImportType {
  CSV = "CSV",
  EXCEL = "Excel",
  XML = "XML",
  JSON = "JSON",
}

export enum Delimiter {
  COMMA = "comma",
  SEMICOLON = "semicolon",
  TAB = "tab",
}

export const MAX_FILE = 1;

export type Import = {
  id: string;
  name: string;
  type: ImportType;
  status: ImportStatus;
  progress?: number; // 0 to 100, optional
  createdAt: string;
  updatedAt: string;
};

export const ALLOWED_EXTENSIONS_BY_TYPE: Record<ImportType, string[]> = {
  [ImportType.CSV]: ["csv"],
  [ImportType.EXCEL]: ["xls", "xlsx"],
  [ImportType.XML]: ["xml"],
  [ImportType.JSON]: ["json"],
};

export enum ImportStatus {
  ALL = "all",
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum ImportFilter {
  STATUS = "status",
  UPDATEDAT = "updatedAt",
  NAME = "name",
}

export type DeleteImport = {
  importId: string;
  showLoader: () => void;
  hideLoader: () => void;
  removeImport: (id: string) => void;
  onSuccess?: () => void;
  onError?: () => void;
};
