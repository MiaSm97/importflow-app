import { Import, ImportStatus } from "@/lib/types/types";

const STORAGE_KEY = "imports";
export const IMPORTS_REPOSITORY_LOCAL_MODE_EVENT =
  "imports-repository:local-mode";

type SupabaseImportRow = {
  id: string;
  name: string;
  type: Import["type"];
  status: Import["status"];
  progress: number | null;
  created_at: string;
  updated_at: string;
};

type CreateImportInput = {
  name: string;
  type: Import["type"];
  status?: Import["status"];
  progress?: number;
};

type ListImportsPageInput = {
  limit: number;
  offset: number;
  status?: ImportStatus;
};

type ListImportsPageResult = {
  imports: Import[];
  total: number;
};

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
};

const notifyLocalMode = (source: "missing-config" | "supabase-error") => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(IMPORTS_REPOSITORY_LOCAL_MODE_EVENT, {
      detail: { source },
    }),
  );
};

const logRepositoryError = (
  operation: "listImports" | "createImport",
  error: unknown,
) => {
  console.error(`[importsRepository] ${operation} failed, using localStorage`, {
    error,
  });
};

const fromSupabaseRow = (row: SupabaseImportRow): Import => ({
  id: row.id,
  name: row.name,
  type: row.type,
  status: row.status,
  progress: row.progress ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSupabaseInsertRow = (item: Import) => ({
  id: item.id,
  name: item.name,
  type: item.type,
  status: item.status,
  progress: item.progress ?? null,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
});

const readLocalImports = (): Import[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const writeLocalImports = (imports: Import[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(imports));
};

const createLocalImport = (input: CreateImportInput): Import => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    status: input.status ?? ImportStatus.COMPLETED,
    progress: input.progress,
    createdAt: now,
    updatedAt: now,
  };
};

export const listImports = async (): Promise<Import[]> => {
  const config = getSupabaseConfig();
  if (!config) {
    notifyLocalMode("missing-config");
    return readLocalImports();
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/imports?select=id,name,type,status,progress,created_at,updated_at&order=updated_at.desc`,
      {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch imports from Supabase");
    }

    const rows = (await response.json()) as SupabaseImportRow[];
    return rows.map(fromSupabaseRow);
  } catch (error) {
    logRepositoryError("listImports", error);
    notifyLocalMode("supabase-error");
    return readLocalImports();
  }
};

const parseTotalFromContentRange = (contentRange: string | null): number => {
  if (!contentRange) {
    return 0;
  }

  const totalPart = contentRange.split("/")[1];
  if (!totalPart) {
    return 0;
  }

  const parsed = Number(totalPart);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const listImportsPage = async ({
  limit,
  offset,
  status,
}: ListImportsPageInput): Promise<ListImportsPageResult> => {
  const normalizedLimit = Math.max(1, limit);
  const normalizedOffset = Math.max(0, offset);
  const shouldFilterByStatus = status && status !== ImportStatus.ALL;

  const config = getSupabaseConfig();
  if (!config) {
    notifyLocalMode("missing-config");
    const localImports = readLocalImports();
    const filtered = shouldFilterByStatus
      ? localImports.filter((item) => item.status === status)
      : localImports;
    return {
      imports: filtered.slice(
        normalizedOffset,
        normalizedOffset + normalizedLimit,
      ),
      total: filtered.length,
    };
  }

  try {
    const params = new URLSearchParams({
      select: "id,name,type,status,progress,created_at,updated_at",
      order: "updated_at.desc",
      limit: String(normalizedLimit),
      offset: String(normalizedOffset),
    });

    if (shouldFilterByStatus) {
      params.set("status", `eq.${status}`);
    }

    const response = await fetch(`${config.url}/rest/v1/imports?${params}`, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        Prefer: "count=exact",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch paginated imports from Supabase");
    }

    const rows = (await response.json()) as SupabaseImportRow[];
    return {
      imports: rows.map(fromSupabaseRow),
      total: parseTotalFromContentRange(response.headers.get("content-range")),
    };
  } catch (error) {
    logRepositoryError("listImports", error);
    notifyLocalMode("supabase-error");
    const localImports = readLocalImports();
    const filtered = shouldFilterByStatus
      ? localImports.filter((item) => item.status === status)
      : localImports;
    return {
      imports: filtered.slice(
        normalizedOffset,
        normalizedOffset + normalizedLimit,
      ),
      total: filtered.length,
    };
  }
};

export const createImport = async (
  input: CreateImportInput,
): Promise<Import> => {
  const config = getSupabaseConfig();
  const newImport = createLocalImport(input);

  if (!config) {
    notifyLocalMode("missing-config");
    const current = readLocalImports();
    writeLocalImports([newImport, ...current]);
    return newImport;
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/imports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(toSupabaseInsertRow(newImport)),
    });

    if (!response.ok) {
      throw new Error("Failed to create import in Supabase");
    }

    const [createdRow] = (await response.json()) as SupabaseImportRow[];
    return fromSupabaseRow(createdRow);
  } catch (error) {
    logRepositoryError("createImport", error);
    notifyLocalMode("supabase-error");
    const current = readLocalImports();
    writeLocalImports([newImport, ...current]);
    return newImport;
  }
};
