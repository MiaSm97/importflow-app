'use client';

import ImportsEmpty from "@/app/components/empty-states/ImportsEmpty";
import ImportsTable from "@/app/components/imports-table/ImportsTable";
import NewImport from "@/app/components/popup/NewImport";
import Button from "@/app/components/ui/button/Button";
import SearchIcon from "@/app/components/ui/icons/SearchIcon";
import Input from "@/app/components/ui/input/Input";
import Modal from "@/app/components/ui/modal/Modal";
import useModal from "@/app/components/ui/modal/useModal";
import { handleExportImports } from "@/lib/commonFunctions";
import { useMenu } from "@/lib/context/MenuContext";
import { listImportsPage } from "@/lib/data/importsRepository";
import { Import, ImportStatus } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CiExport } from "react-icons/ci";

const PAGE_SIZE = 8;

export default function ImportsPage() {
    const t = useTranslations();
    const router = useRouter();
    const { imports } = useMenu();
    const { isOpen, toggle } = useModal();
    const [filter, setFilter] = useState<ImportStatus>(ImportStatus.ALL);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentImports, setCurrentImports] = useState<Import[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingImports, setIsLoadingImports] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // In-memory page cache: key = "<status>:<search>:<page>".
    // This prevents re-fetching pages already visited in this session.
    const cacheRef = useRef<Record<string, Import[]>>({});
    // Stores total count per filter+search to keep pagination stable without extra calls.
    const totalsByFilterRef = useRef<Record<string, number>>({});
    // Guards against out-of-order async responses when users switch quickly.
    const requestIdRef = useRef(0);
    const previousImportsCountRef = useRef(imports.length);

    const handleFilterImports = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStatus = event.target.value as ImportStatus;
        setFilter(selectedStatus);
        setCurrentPage(1);
    }

    const getTotalsCacheKey = useCallback(
        (status: ImportStatus, query: string) => `${status}:${query.trim().toLowerCase()}`,
        [],
    );
    const getPageCacheKey = useCallback(
        (status: ImportStatus, query: string, page: number) => `${status}:${query.trim().toLowerCase()}:${page}`,
        [],
    );

    const loadImportsPage = useCallback(async (status: ImportStatus, query: string, page: number) => {
        const requestId = ++requestIdRef.current;
        const pageKey = getPageCacheKey(status, query, page);
        const totalsKey = getTotalsCacheKey(status, query);
        const cachedPage = cacheRef.current[pageKey];
        const cachedTotal = totalsByFilterRef.current[totalsKey];

        if (cachedPage) {
            // Fast path: serve from cache without network roundtrip.
            setCurrentImports(cachedPage);
            setTotalItems(cachedTotal ?? cachedPage.length);
            setIsLoadingImports(false);
            return;
        }

        setIsLoadingImports(true);
        try {
            const { imports, total } = await listImportsPage({
                limit: PAGE_SIZE,
                offset: (page - 1) * PAGE_SIZE,
                status,
                search: query,
            });

            if (requestId !== requestIdRef.current) {
                // A newer request finished later; ignore this stale response.
                return;
            }

            cacheRef.current[pageKey] = imports;
            totalsByFilterRef.current[totalsKey] = total;
            setCurrentImports(imports);
            setTotalItems(total);
        } catch {
            if (requestId === requestIdRef.current) {
                setCurrentImports([]);
                setTotalItems(0);
            }
        } finally {
            if (requestId === requestIdRef.current) {
                setIsLoadingImports(false);
            }
        }
    }, [getPageCacheKey, getTotalsCacheKey]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        void loadImportsPage(filter, debouncedSearch, currentPage);
    }, [debouncedSearch, filter, currentPage, loadImportsPage]);

    useEffect(() => {
        if (imports.length === previousImportsCountRef.current) {
            return;
        }

        // Data changed globally (e.g. new import): invalidate cache and reload page 1.
        previousImportsCountRef.current = imports.length;
        cacheRef.current = {};
        totalsByFilterRef.current = {};
        setCurrentPage(1);
        void loadImportsPage(filter, debouncedSearch, 1);
    }, [debouncedSearch, filter, imports.length, loadImportsPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filter]);

    useEffect(() => {
        if (isExpanded) {
            inputRef.current?.focus();
        }
    }, [isExpanded]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems]);

    const handleExportFilteredImports = useCallback(async () => {
        const totalsKey = getTotalsCacheKey(filter, debouncedSearch);
        const cachedTotal = totalsByFilterRef.current[totalsKey] ?? totalItems;
        const pageCount = Math.max(1, Math.ceil(cachedTotal / PAGE_SIZE));
        const missingPages: number[] = [];
        for (let page = 1; page <= pageCount; page += 1) {
            const pageKey = getPageCacheKey(filter, debouncedSearch, page);
            if (!cacheRef.current[pageKey]) {
                missingPages.push(page);
            }
        }

        const fetchedPages = await Promise.all(
            missingPages.map(async (page) => {
                const { imports } = await listImportsPage({
                    limit: PAGE_SIZE,
                    offset: (page - 1) * PAGE_SIZE,
                    status: filter,
                    search: debouncedSearch,
                });
                return { page, imports };
            }),
        );

        fetchedPages.forEach(({ page, imports }) => {
            const pageKey = getPageCacheKey(filter, debouncedSearch, page);
            cacheRef.current[pageKey] = imports;
        });

        const importsToExport = Array.from({ length: pageCount }, (_, index) => {
            const page = index + 1;
            const pageKey = getPageCacheKey(filter, debouncedSearch, page);
            return cacheRef.current[pageKey] ?? [];
        }).flat();

        handleExportImports(importsToExport);
    }, [debouncedSearch, filter, getPageCacheKey, getTotalsCacheKey, totalItems]);

    const handleImportDeleted = useCallback((deletedImportId: string) => {
        previousImportsCountRef.current = Math.max(0, previousImportsCountRef.current - 1);
        cacheRef.current = {};
        totalsByFilterRef.current = {};

        setCurrentImports((prev) => prev.filter((item) => item.id !== deletedImportId));

        const nextTotal = Math.max(0, totalItems - 1);
        setTotalItems(nextTotal);

        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
        const nextPage = Math.min(currentPage, nextTotalPages);

        if (nextPage !== currentPage) {
            setCurrentPage(nextPage);
            return;
        }

        if (nextTotal > 0) {
            void loadImportsPage(filter, debouncedSearch, nextPage);
        }
    }, [currentPage, debouncedSearch, filter, loadImportsPage, totalItems]);

    return (
        <>
            <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden sm:h-auto sm:overflow-visible">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-[22px] font-bold">{t("imports.title")}</h1>
                    <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                            classname="flex-1 sm:flex-none"
                            type="secondary"
                            leftIcon={<CiExport />}
                            label={t("imports.buttons.export")}
                            isDisabled={totalItems === 0}
                            onClick={() => { void handleExportFilteredImports(); }}
                        />
                        <Button classname="flex-1 sm:flex-none" label={t("imports.buttons.new")} onClick={toggle} />
                    </div>
                </div>
                <div className="flex flex-col items-start justify-start gap-2 sm:flex-row sm:items-center">
                    <Input type="select" label={t("imports.filter")} className="w-full sm:w-50" onChange={handleFilterImports}>
                        <option value={ImportStatus.ALL}>{t("imports.filterOptions.all")}</option>
                        <option value={ImportStatus.COMPLETED}>{t("imports.filterOptions.completed")}</option>
                        <option value={ImportStatus.PENDING}>{t("imports.filterOptions.pending")}</option>
                        <option value={ImportStatus.FAILED}>{t("imports.filterOptions.failed")}</option>
                    </Input>
                    <div className="w-full sm:w-50">
                        {!isExpanded ?
                            <div className="flex flex-col">
                                <p className="text-[12px] text-textGray">{t('imports.search')}</p>
                                <div className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center border border-textGray cursor-pointer" onClick={() => setIsExpanded(true)}>
                                    <SearchIcon />
                                </div>
                            </div>
                            : <Input
                                label={t('imports.search')}
                                className="w-full"
                                classNameInput="w-full"
                                placeholder={t('imports.searchPlaceholder')}
                                value={search}
                                type="search"
                                onChange={(event) => setSearch(event.target.value)}
                                onBlur={() => setIsExpanded(false)}
                                ref={inputRef}
                            />
                        }
                    </div>
                </div>
                {!isLoadingImports && totalItems === 0 ? (
                    <ImportsEmpty onCtaClick={toggle} />
                ) : (
                    <div className="min-h-0 flex-1 sm:flex-none">
                        <ImportsTable
                            imports={currentImports}
                            itemsPerPage={PAGE_SIZE}
                            mobileScrollable
                            isLoading={isLoadingImports}
                            onRowClick={(importItem) => router.push(`/imports/${importItem.id}/detail`)}
                            onImportDeleted={handleImportDeleted}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onNextPageChange={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            onPreviousPageChange={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        />
                    </div>
                )}
            </div>
            <Modal className="px-0" isOpen={isOpen}>
                <NewImport toggle={toggle} />
            </Modal>
        </>
    );
}
