export type MenuOptions = {
  title?: string;
  backButtonUrl?: any;
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
