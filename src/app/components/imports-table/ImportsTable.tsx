import { Import } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import TablePages from "./TablePages";
import { useEffect, useState } from "react";
import { getColor } from "@/lib/commonFunctions";
import Box from "../box/Box";
import { CiExport } from "react-icons/ci";
import ProgressBar from "../bar/ProgressBar";

type ImportsTableProps = {
    imports: Import[];
    onExport?: () => void;
    mobileScrollable?: boolean;
    isLoading?: boolean;
    currentPage?: number;
    totalPages?: number;
    onNextPageChange?: () => void;
    onPreviousPageChange?: () => void;
};

function ImportsTable({
    imports,
    onExport,
    mobileScrollable = false,
    isLoading = false,
    currentPage,
    totalPages,
    onNextPageChange,
    onPreviousPageChange,
}: ImportsTableProps) {
    const t = useTranslations();
    const [localPage, setLocalPage] = useState(1);
    const itemsPerPage = 5;
    const isServerPaginated = typeof currentPage === "number"
        && typeof totalPages === "number"
        && typeof onNextPageChange === "function"
        && typeof onPreviousPageChange === "function";
    const safeCurrentPage = isServerPaginated ? currentPage : localPage;
    const safeTotalPages = isServerPaginated ? totalPages : Math.max(1, Math.ceil(imports.length / itemsPerPage));
    const handleNextPage = isServerPaginated
        ? onNextPageChange!
        : () => setLocalPage(prev => Math.min(safeTotalPages, prev + 1));
    const handlePreviousPage = isServerPaginated
        ? onPreviousPageChange!
        : () => setLocalPage(prev => Math.max(1, prev - 1));
    const paginatedImports = isServerPaginated
        ? imports
        : imports.slice((localPage - 1) * itemsPerPage, localPage * itemsPerPage);
    const formatUpdatedAt = (date: string) => new Date(date).toLocaleString();
    const skeletonRows = Array.from({ length: itemsPerPage }, (_, index) => index);

    useEffect(() => {
        if (!isServerPaginated && localPage > safeTotalPages) {
            setLocalPage(safeTotalPages);
        }
    }, [isServerPaginated, localPage, safeTotalPages]);

    return (
        <Box classname={`flex flex-col p-0! ${mobileScrollable ? "h-full min-h-0" : ""}`}>
            {onExport &&
                <div className="flex flex-col justify-between gap-2 border-b-custom p-4 sm:flex-row sm:items-center sm:p-6">
                    <h2 className="text-xl font-semibold sm:text-[22px]">{t("imports.latestImports")}</h2>
                    <div className="flex gap-2 items-center cursor-pointer" onClick={onExport}>
                        <CiExport />
                        <span className="text-textGray">{t("imports.buttons.export")}</span>
                    </div>
                </div>
            }
            <div className={`sm:hidden ${mobileScrollable ? "min-h-0 flex-1 overflow-y-auto" : ""}`}>
                {isLoading ? skeletonRows.map((index) => (
                    <div key={`mobile-skeleton-${index}`} className={`px-4 py-4 ${index !== itemsPerPage - 1 ? "border-b-custom" : ""}`}>
                        <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-bgBtnSecondary" />
                        <div className="mb-2 h-3 w-full animate-pulse rounded bg-bgBtnSecondary" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-bgBtnSecondary" />
                    </div>
                )) : paginatedImports.map((importItem, index) => (
                    <div
                        key={importItem.id}
                        className={`px-4 py-4 ${index !== itemsPerPage - 1 ? "border-b-custom" : ""}`}
                    >
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{importItem.name}</span>
                            <span
                                className="inline-flex shrink-0 rounded-md px-3 py-1 text-xs"
                                style={{ backgroundColor: getColor(importItem.status) }}
                            >
                                {t(`imports.status.${importItem.status.toLowerCase()}`)}
                            </span>
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-[11px] text-textGray">{t("imports.table.progress")}</span>
                            <div className="min-w-0 flex-1">
                                <ProgressBar progress={importItem.progress} status={importItem.status} />
                            </div>
                        </div>
                        <div className="text-[11px] text-textGray">
                            {t("imports.table.updatedAt")}: {formatUpdatedAt(importItem.updatedAt)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden overflow-x-auto sm:block">
                <div className="min-w-[700px]">
                    <div className="flex w-full border-b-custom px-4 pb-4 pt-4 text-textGray sm:px-6">
                        <span className="w-[35%]">{t("imports.table.name")}</span>
                        <span className="mr-2 w-[15%]">{t("imports.table.status")}</span>
                        <span className="w-[35%]">{t("imports.table.progress")}</span>
                        <span className="w-[25%] pl-16">{t("imports.table.updatedAt")}</span>
                    </div>
                    {isLoading ? skeletonRows.map((index) => (
                        <div
                            key={`desktop-skeleton-${index}`}
                            className={`flex w-full items-center px-4 py-3 text-sm sm:px-6 ${index !== itemsPerPage - 1 ? "border-b-custom" : ""}`}
                        >
                            <span className="h-4 w-[35%] animate-pulse rounded bg-bgBtnSecondary" />
                            <span className="mr-2 h-4 w-[15%] animate-pulse rounded bg-bgBtnSecondary" />
                            <span className="h-4 w-[35%] animate-pulse rounded bg-bgBtnSecondary" />
                            <span className="h-4 w-[25%] animate-pulse rounded bg-bgBtnSecondary" />
                        </div>
                    )) : paginatedImports.map((importItem, index) => (
                        <div
                            key={importItem.id}
                            className={`flex w-full items-center px-4 py-3 text-sm sm:px-6 ${index !== itemsPerPage - 1 ? "border-b-custom" : ""}`}
                        >
                            <span className="w-[35%] truncate pr-2 text-ellipsis">{importItem.name}</span>
                            <span className="mr-2 w-[15%]">
                                <span
                                    className="inline-flex rounded-md px-3 py-1"
                                    style={{ backgroundColor: getColor(importItem.status) }}
                                >
                                    {t(`imports.status.${importItem.status.toLowerCase()}`)}
                                </span>
                            </span>
                            <div className="w-[35%]">
                                <ProgressBar progress={importItem.progress} status={importItem.status} />
                            </div> {/* For demo purposes, we set progress to 100% directly */}
                            <span className="w-[25%] pl-16">{formatUpdatedAt(importItem.updatedAt)}</span>
                        </div>
                    ))}
                </div>
            </div>
            {
                (isServerPaginated ? safeTotalPages > 1 : imports.length > itemsPerPage) &&
                <TablePages
                    currentPage={safeCurrentPage}
                    totalPages={safeTotalPages}
                    onNextPageChange={handleNextPage}
                    onPreviousPageChange={handlePreviousPage}
                />
            }
        </Box>
    );
}

export default ImportsTable;
