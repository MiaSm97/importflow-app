import { Import, ImportFilter } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import TablePages from "./TablePages";
import { useCallback, useEffect, useMemo, useState } from "react";
import { executeDeleteImport, getColor } from "@/lib/commonFunctions";
import Box from "../box/Box";
import { CiExport } from "react-icons/ci";
import ProgressBar from "../bar/ProgressBar";
import LoadData from "../loading/LoadData";
import Filters from "../ui/filters/Filters";
import Actions from "../ui/actions/Actions";
import useModal from "../ui/modal/useModal";
import Modal from "../ui/modal/Modal";
import WarningPopup from "../popup/WarningPopup";
import { useMenu } from "@/lib/context/MenuContext";

type ImportsTableProps = {
    imports: Import[];
    onExport?: () => void;
    showSorting?: boolean;
    itemsPerPage?: number;
    mobileScrollable?: boolean;
    isLoading?: boolean;
    onRowClick?: (importItem: Import) => void;
    onImportDeleted?: (deletedImportId: string) => void;
    currentPage?: number;
    totalPages?: number;
    onNextPageChange?: () => void;
    onPreviousPageChange?: () => void;
};

function ImportsTable({
    imports,
    onExport,
    showSorting = true,
    itemsPerPage = 5,
    mobileScrollable = false,
    isLoading = false,
    onRowClick,
    onImportDeleted,
    currentPage,
    totalPages,
    onNextPageChange,
    onPreviousPageChange,
}: ImportsTableProps) {
    const t = useTranslations();
    const { toastAlert, showLoader, removeImport, hideLoader, toastInfo } = useMenu();
    const [localPage, setLocalPage] = useState(1);
    const [decreasing, setDecreasing] = useState(false);
    const [importFile, setImportFile] = useState<Import | undefined>(undefined);
    const [filter, setFilter] = useState<ImportFilter>(ImportFilter.UPDATEDAT);
    const { toggle, isOpen } = useModal();
    // This table can work in two modes:
    // - local pagination (legacy/dashboard)
    // - controlled pagination (imports page, data already sliced by server)
    const isServerPaginated = typeof currentPage === "number"
        && typeof totalPages === "number"
        && typeof onNextPageChange === "function"
        && typeof onPreviousPageChange === "function";
    const sortedImports = useMemo(() => {
        if (!showSorting) {
            return imports;
        }

        return [...imports].sort((firstItem, secondItem) => {
            let comparison = 0;
            if (filter === ImportFilter.NAME) {
                comparison = firstItem.name.localeCompare(secondItem.name);
            } else if (filter === ImportFilter.STATUS) {
                comparison = firstItem.status.localeCompare(secondItem.status);
            } else {
                comparison = new Date(firstItem.updatedAt).getTime() - new Date(secondItem.updatedAt).getTime();
            }

            return decreasing ? -comparison : comparison;
        });
    }, [decreasing, filter, imports, showSorting]);

    const safeCurrentPage = isServerPaginated ? currentPage : localPage;
    const safeTotalPages = isServerPaginated ? totalPages : Math.max(1, Math.ceil(sortedImports.length / itemsPerPage));
    const handleNextPage = isServerPaginated
        ? onNextPageChange!
        : () => setLocalPage(prev => Math.min(safeTotalPages, prev + 1));
    const handlePreviousPage = isServerPaginated
        ? onPreviousPageChange!
        : () => setLocalPage(prev => Math.max(1, prev - 1));
    const paginatedImports = isServerPaginated
        ? sortedImports
        : sortedImports.slice((localPage - 1) * itemsPerPage, localPage * itemsPerPage);
    const formatUpdatedAt = (date: string) => new Date(date).toLocaleString();
    // Keep skeleton rows aligned with page size to avoid layout jumps while loading.
    const skeletonRows = Array.from({ length: itemsPerPage }, (_, index) => index);

    const handleDeleteImport = useCallback(async (importItem?: Import) => {
        if (!importItem) return;

        await executeDeleteImport({
            importId: importItem.id,
            showLoader,
            hideLoader,
            removeImport,
            onSuccess: () => {
                setImportFile(undefined);
                toastInfo(t("imports.detail.deleteSuccess"));
                toggle();
                onImportDeleted?.(importItem.id);
            },
            onError: () => {
                toastAlert(t("imports.detail.deleteError"));
            },
        });
    }, [hideLoader, onImportDeleted, removeImport, showLoader, t, toastAlert, toastInfo, toggle]);

    useEffect(() => {
        // If filters/data reduce the total amount, clamp to the last valid page.
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
            <div className={`sm:hidden ${mobileScrollable ? "min-h-0 flex flex-1 flex-col overflow-hidden" : ""}`}>
                {showSorting && (
                    <div className="px-4 py-3 flex gap-2">
                        <Filters
                            decreasing={decreasing}
                            filter={filter}
                            setDecreasing={setDecreasing}
                            setFilter={setFilter}
                            isMobile
                        />
                    </div>
                )}
                <div className={mobileScrollable ? "min-h-0 flex-1 overflow-y-auto" : ""}>
                    {isLoading ? skeletonRows.map((index) => (
                        <div key={`mobile-skeleton-${index}`} className={`px-4 py-4 ${index !== itemsPerPage - 1 ? "border-b-custom" : ""}`}>
                            <LoadData className="mb-3 h-4 w-2/3" />
                            <LoadData className="mb-2 h-3 w-full" />
                            <LoadData className="h-3 w-1/2" />
                        </div>
                    )) : paginatedImports.map((importItem, index) => (
                        <div
                            key={importItem.id}
                            className={`px-4 py-4 ${index !== paginatedImports.length - 1 ? "border-b-custom" : ""} ${onRowClick ? "cursor-pointer transition-colors hover:bg-bgBtnSecondary" : ""}`}
                            onClick={() => onRowClick?.(importItem)}
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{importItem.name}</span>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span
                                        className="inline-flex rounded-md px-3 py-1 text-xs"
                                        style={{ backgroundColor: getColor(importItem.status) }}
                                    >
                                        {t(`imports.status.${importItem.status.toLowerCase()}`)}
                                    </span>
                                    <Actions
                                        setImport={setImportFile}
                                        toggle={toggle}
                                        importItem={importItem}
                                    />
                                </div>
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
            </div>

            <div className="hidden overflow-x-auto sm:block">
                <div className="min-w-[700px]">
                    <div className="flex w-full border-b-custom px-4 pb-4 pt-4 text-textGray sm:px-6">
                        <span className="w-[20%]">{t("imports.table.name")}</span>
                        <span className="mr-2 w-[15%]">{t("imports.table.status")}</span>
                        <span className="w-[25%]">{t("imports.table.progress")}</span>
                        <span className="w-[20%] pl-16">{t("imports.table.updatedAt")}</span>
                        {showSorting && (
                            <Filters decreasing={decreasing} filter={filter} setDecreasing={setDecreasing} setFilter={setFilter} />
                        )}
                    </div>
                    {isLoading ? skeletonRows.map((index) => (
                        <div
                            key={`desktop-skeleton-${index}`}
                            className={`flex w-full items-center px-4 py-3 text-sm sm:px-6 ${index !== itemsPerPage - 1 ? "border-b-custom" : ""}`}
                        >
                            <LoadData className="h-4 w-[20%]" />
                            <LoadData className="mr-2 h-4 w-[15%]" />
                            <LoadData className="h-4 w-[25%]" />
                            <LoadData className="h-4 w-[20%]" />
                            <span className="w-[18%]" />
                        </div>
                    )) : paginatedImports.map((importItem, index) => (
                        <div
                            key={importItem.id}
                            className={`flex w-full items-center px-4 py-3 text-sm sm:px-6 ${index !== paginatedImports.length - 1 ? "border-b-custom" : ""} ${onRowClick ? "cursor-pointer transition-colors hover:bg-bgBtnSecondary" : ""}`}
                            onClick={() => onRowClick?.(importItem)}
                        >
                            <span className="w-[20%] truncate pr-2 text-ellipsis">{importItem.name}</span>
                            <span className="mr-2 w-[15%]">
                                <span
                                    className="inline-flex rounded-md px-3 py-1"
                                    style={{ backgroundColor: getColor(importItem.status) }}
                                >
                                    {t(`imports.status.${importItem.status.toLowerCase()}`)}
                                </span>
                            </span>
                            <div className="w-[25%]">
                                <ProgressBar progress={importItem.progress} status={importItem.status} />
                            </div>
                            <span className="w-[20%] pl-16">{formatUpdatedAt(importItem.updatedAt)}</span>
                            <div className="w-[18%] flex justify-end">
                                <Actions setImport={setImportFile} toggle={toggle}
                                    importItem={importItem}
                                />
                            </div>
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
            <Modal isOpen={isOpen}>
                <WarningPopup toggle={toggle} onSubmit={() => handleDeleteImport(importFile)} />
            </Modal>
        </Box>
    );
}

export default ImportsTable;
