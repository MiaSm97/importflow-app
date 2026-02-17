import { Import, ImportStatus } from "@/lib/types/types";

const STORAGE_KEY = "imports";
const IMPORT_FILES_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_IMPORTS_BUCKET ?? "import-files";
export const IMPORTS_REPOSITORY_LOCAL_MODE_EVENT =
  "imports-repository:local-mode";
let hasLoggedStorageConfig = false;

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
  search?: string;
};

type ListImportsPageResult = {
  imports: Import[];
  total: number;
};

type GetImportByIdResult = Import | null;

type ImportFileDownload = {
  fileName: string;
  url: string;
};

type SupabaseStorageObject = {
  name: string;
  metadata?: {
    size?: number;
  } | null;
};

type ImportFileInfo = {
  fileName: string;
  fileSize: number | null;
};

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasLoggedStorageConfig && typeof window !== "undefined") {
    hasLoggedStorageConfig = true;
    console.info(
      `[importsRepository] storage config: bucket=${IMPORT_FILES_BUCKET}, hasUrl=${Boolean(
        url,
      )}, hasAnonKey=${Boolean(anonKey)}`,
    );
  }

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
};

const getSupabaseHeaders = (
  config: SupabaseConfig,
  additionalHeaders?: Record<string, string>,
) => ({
  apikey: config.anonKey,
  Authorization: `Bearer ${config.anonKey}`,
  ...additionalHeaders,
});

const notifyLocalMode = (source: "missing-config" | "supabase-error") => {
  if (typeof window === "undefined") {
    return;
  }

  // Broadcast once-per-session UI feedback from a central repository layer.
  window.dispatchEvent(
    new CustomEvent(IMPORTS_REPOSITORY_LOCAL_MODE_EVENT, {
      detail: { source },
    }),
  );
};

const logRepositoryError = (
  operation:
    | "listImports"
    | "getImportById"
    | "createImport"
    | "deleteImport"
    | "uploadImportFile"
    | "getImportFileInfo"
    | "getImportFileDownload",
  error: unknown,
) => {
  const normalizedError =
    error instanceof Error
      ? `${error.message}${error.stack ? `\n${error.stack}` : ""}`
      : { message: String(error) };
  console.error(
    `[importsRepository] ${operation} failed: ${
      typeof normalizedError === "string"
        ? normalizedError
        : JSON.stringify(normalizedError)
    }`,
  );
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
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Import[];
  } catch (error) {
    logRepositoryError("listImports", error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

const writeLocalImports = (imports: Import[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(imports));
};

const normalizeStorageSegment = (segment: string) => {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
};

const toStoragePath = (importId: string, fileName: string) =>
  `${normalizeStorageSegment(importId)}/${normalizeStorageSegment(fileName)}`;

const getLocalImportsByStatus = (status?: ImportStatus): Import[] => {
  const imports = readLocalImports();
  if (!status || status === ImportStatus.ALL) {
    return imports;
  }

  return imports.filter((item) => item.status === status);
};

const filterImportsBySearch = (imports: Import[], search?: string): Import[] => {
  const normalizedSearch = search?.trim().toLowerCase();
  if (!normalizedSearch) {
    return imports;
  }

  return imports.filter((item) => {
    const normalizedName = item.name.toLowerCase();
    const normalizedId = item.id.toLowerCase();
    return (
      normalizedName.includes(normalizedSearch)
      || normalizedId.includes(normalizedSearch)
    );
  });
};

const escapeSearchForPostgrestOr = (search: string) =>
  search.replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll("(", "\\(").replaceAll(")", "\\)");

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const getLocalImportsPage = (
  limit: number,
  offset: number,
  status?: ImportStatus,
  search?: string,
): ListImportsPageResult => {
  const filteredImports = filterImportsBySearch(
    getLocalImportsByStatus(status),
    search,
  );
  return {
    imports: filteredImports.slice(offset, offset + limit),
    total: filteredImports.length,
  };
};

const getLocalImportById = (id: string): Import | null =>
  readLocalImports().find((item) => item.id === id) ?? null;

const removeLocalImportById = (id: string) => {
  const remainingImports = readLocalImports().filter((item) => item.id !== id);
  writeLocalImports(remainingImports);
};

const getImportFileInfoPrefix = (importId: string) => `${importId}/`;

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
        headers: getSupabaseHeaders(config),
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
  search,
}: ListImportsPageInput): Promise<ListImportsPageResult> => {
  // Sanitize pagination input to keep URL params and local fallback aligned.
  const normalizedLimit = Math.max(1, limit);
  const normalizedOffset = Math.max(0, offset);
  const normalizedSearch = search?.trim();
  const shouldFilterByStatus = status && status !== ImportStatus.ALL;

  const config = getSupabaseConfig();
  if (!config) {
    notifyLocalMode("missing-config");
    return getLocalImportsPage(
      normalizedLimit,
      normalizedOffset,
      shouldFilterByStatus ? status : undefined,
      normalizedSearch,
    );
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
    if (normalizedSearch) {
      const escapedSearch = escapeSearchForPostgrestOr(normalizedSearch);
      const orFilters = [`name.ilike.*${escapedSearch}*`];
      if (isUuid(normalizedSearch)) {
        // `id` is UUID in Supabase; use equality only when the search term is a valid UUID.
        orFilters.push(`id.eq.${normalizedSearch}`);
      }
      params.set(
        "or",
        `(${orFilters.join(",")})`,
      );
    }

    const response = await fetch(`${config.url}/rest/v1/imports?${params}`, {
      headers: getSupabaseHeaders(config, {
        // Supabase/PostgREST returns total count in Content-Range.
        Prefer: "count=exact",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to fetch paginated imports from Supabase (${response.status}): ${errorBody}`,
      );
    }

    const rows = (await response.json()) as SupabaseImportRow[];
    return {
      imports: rows.map(fromSupabaseRow),
      total: parseTotalFromContentRange(response.headers.get("content-range")),
    };
  } catch (error) {
    logRepositoryError("listImports", error);
    notifyLocalMode("supabase-error");
    return getLocalImportsPage(
      normalizedLimit,
      normalizedOffset,
      shouldFilterByStatus ? status : undefined,
      normalizedSearch,
    );
  }
};

export const getImportById = async (id: string): Promise<GetImportByIdResult> => {
  const config = getSupabaseConfig();
  if (!config) {
    notifyLocalMode("missing-config");
    return getLocalImportById(id);
  }

  try {
    const params = new URLSearchParams({
      select: "id,name,type,status,progress,created_at,updated_at",
      id: `eq.${id}`,
      limit: "1",
    });

    const response = await fetch(`${config.url}/rest/v1/imports?${params}`, {
      headers: getSupabaseHeaders(config),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch import detail from Supabase");
    }

    const rows = (await response.json()) as SupabaseImportRow[];
    if (rows.length === 0) {
      return null;
    }

    return fromSupabaseRow(rows[0]);
  } catch (error) {
    logRepositoryError("getImportById", error);
    notifyLocalMode("supabase-error");
    return getLocalImportById(id);
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
      headers: getSupabaseHeaders(config, {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      }),
      body: JSON.stringify(toSupabaseInsertRow(newImport)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create import in Supabase (${response.status}): ${errorText}`,
      );
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

export const deleteImport = async (id: string): Promise<void> => {
  const config = getSupabaseConfig();
  if (!config) {
    notifyLocalMode("missing-config");
    removeLocalImportById(id);
    return;
  }

  try {
    const deleteImportResponse = await fetch(
      `${config.url}/rest/v1/imports?id=eq.${id}`,
      {
        method: "DELETE",
        headers: getSupabaseHeaders(config, {
          Prefer: "return=representation",
        }),
      },
    );

    if (!deleteImportResponse.ok) {
      throw new Error("Failed to delete import from Supabase");
    }

    const deletedRows = (await deleteImportResponse.json()) as SupabaseImportRow[];
    if (!Array.isArray(deletedRows) || deletedRows.length === 0) {
      throw new Error(
        "Delete request succeeded but no rows were deleted. Check Supabase RLS delete policy.",
      );
    }

    // The DB row is the source of truth for list visibility.
    // If storage cleanup fails, keep the deletion successful and log the issue.
    const fileInfo = await getImportFileInfo(id);
    if (fileInfo?.fileName) {
      const filePath = toStoragePath(id, fileInfo.fileName);
      const deleteFileResponse = await fetch(
        `${config.url}/storage/v1/object/${IMPORT_FILES_BUCKET}`,
        {
          method: "DELETE",
          headers: getSupabaseHeaders(config, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ prefixes: [filePath] }),
        },
      );

      if (!deleteFileResponse.ok) {
        logRepositoryError(
          "deleteImport",
          new Error("Failed to delete import file from Supabase Storage"),
        );
      }
    }

  } catch (error) {
    logRepositoryError("deleteImport", error);
    notifyLocalMode("supabase-error");
    throw error;
  }
};

export const uploadImportFile = async (importId: string, file: File) => {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase config is missing for file upload");
  }

  try {
    const path = toStoragePath(importId, file.name);
    const response = await fetch(
      `${config.url}/storage/v1/object/${IMPORT_FILES_BUCKET}/${path}`,
      {
        method: "POST",
        headers: getSupabaseHeaders(config, {
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true",
        }),
        body: file,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[importsRepository] storage upload request failed: status=${response.status} statusText=${response.statusText} url=${config.url}/storage/v1/object/${IMPORT_FILES_BUCKET}/${path} body=${errorText}`,
      );
      throw new Error(
        `Failed to upload import file to Supabase Storage (${response.status} ${response.statusText}): ${errorText}`,
      );
    }
  } catch (error) {
    logRepositoryError("uploadImportFile", error);
    throw error;
  }
};

export const getImportFileDownload = async (
  importId: string,
): Promise<ImportFileDownload | null> => {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    const fileInfo = await getImportFileInfo(importId);
    if (!fileInfo?.fileName) {
      return null;
    }

    const storagePath = toStoragePath(importId, fileInfo.fileName);
    const signedUrlResponse = await fetch(
      `${config.url}/storage/v1/object/sign/${IMPORT_FILES_BUCKET}/${storagePath}`,
      {
        method: "POST",
        headers: getSupabaseHeaders(config, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ expiresIn: 60 }),
      },
    );

    if (!signedUrlResponse.ok) {
      throw new Error("Failed to create signed download URL");
    }

    const payload = (await signedUrlResponse.json()) as {
      signedURL?: string;
      signedUrl?: string;
    };
    const signedPath = payload.signedURL ?? payload.signedUrl;

    if (!signedPath) {
      throw new Error("Signed URL is missing in response");
    }

    return {
      fileName: fileInfo.fileName,
      url: `${config.url}/storage/v1${signedPath}`,
    };
  } catch (error) {
    logRepositoryError("getImportFileDownload", error);
    return null;
  }
};

export const getImportFileInfo = async (
  importId: string,
): Promise<ImportFileInfo | null> => {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    const listResponse = await fetch(
      `${config.url}/storage/v1/object/list/${IMPORT_FILES_BUCKET}`,
      {
        method: "POST",
        headers: getSupabaseHeaders(config, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          prefix: getImportFileInfoPrefix(importId),
          limit: 1,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        }),
      },
    );

    if (!listResponse.ok) {
      throw new Error("Failed to list import files from Supabase Storage");
    }

    const [firstFile] = (await listResponse.json()) as SupabaseStorageObject[];
    if (!firstFile?.name) {
      return null;
    }

    return {
      fileName: firstFile.name,
      fileSize:
        typeof firstFile.metadata?.size === "number"
          ? firstFile.metadata.size
          : null,
    };
  } catch (error) {
    logRepositoryError("getImportFileInfo", error);
    return null;
  }
};
