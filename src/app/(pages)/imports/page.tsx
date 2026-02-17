'use client';

import ImportsEmpty from "@/app/components/empty-states/ImportsEmpty";
import ImportsTable from "@/app/components/imports-table/ImportsTable";
import NewImport from "@/app/components/popup/NewImport";
import Button from "@/app/components/ui/button/Button";
import Input from "@/app/components/ui/input/Input";
import Modal from "@/app/components/ui/modal/Modal";
import useModal from "@/app/components/ui/modal/useModal";
import { handleExportImports } from "@/lib/commonFunctions";
import { useMenu } from "@/lib/context/MenuContext";
import { listImportsPage } from "@/lib/data/importsRepository";
import { Import, ImportStatus } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CiExport } from "react-icons/ci";

const PAGE_SIZE = 5;

export default function ImportsPage() {
    const t = useTranslations();
    const { imports } = useMenu();
    const { isOpen, toggle } = useModal();
    const [filter, setFilter] = useState<ImportStatus>(ImportStatus.ALL);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentImports, setCurrentImports] = useState<Import[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingImports, setIsLoadingImports] = useState(true);
    const cacheRef = useRef<Record<string, Import[]>>({});
    const totalsByFilterRef = useRef<Record<string, number>>({});
    const requestIdRef = useRef(0);
    const previousImportsCountRef = useRef(imports.length);

    const handleFilterImports = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as ImportStatus;
        setFilter(value);
        setCurrentPage(1);
    }

    const loadImportsPage = useCallback(async (status: ImportStatus, page: number) => {
        const requestId = ++requestIdRef.current;
        const pageKey = `${status}:${page}`;
        const cachedPage = cacheRef.current[pageKey];
        const cachedTotal = totalsByFilterRef.current[status];

        if (cachedPage) {
            setCurrentImports(cachedPage);
            setTotalItems(cachedTotal ?? cachedPage.length);
            setIsLoadingImports(false);
            return;
        }

        setIsLoadingImports(true);
        const { imports, total } = await listImportsPage({
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            status,
        });

        if (requestId !== requestIdRef.current) {
            return;
        }

        cacheRef.current[pageKey] = imports;
        totalsByFilterRef.current[status] = total;
        setCurrentImports(imports);
        setTotalItems(total);
        setIsLoadingImports(false);
    }, []);

    useEffect(() => {
        void loadImportsPage(filter, currentPage);
    }, [filter, currentPage, loadImportsPage]);

    useEffect(() => {
        if (imports.length === previousImportsCountRef.current) {
            return;
        }

        previousImportsCountRef.current = imports.length;
        cacheRef.current = {};
        totalsByFilterRef.current = {};
        setCurrentPage(1);
        void loadImportsPage(filter, 1);
    }, [filter, imports.length, loadImportsPage]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems]);

    const handleExportFilteredImports = useCallback(async () => {
        const cachedTotal = totalsByFilterRef.current[filter] ?? totalItems;
        const pageCount = Math.max(1, Math.ceil(cachedTotal / PAGE_SIZE));
        const exports: Import[] = [];

        for (let page = 1; page <= pageCount; page += 1) {
            const pageKey = `${filter}:${page}`;
            if (!cacheRef.current[pageKey]) {
                const { imports } = await listImportsPage({
                    limit: PAGE_SIZE,
                    offset: (page - 1) * PAGE_SIZE,
                    status: filter,
                });
                cacheRef.current[pageKey] = imports;
            }
            exports.push(...cacheRef.current[pageKey]);
        }

        handleExportImports(exports);
    }, [filter, totalItems]);

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
                <div className="flex justify-start">
                    <Input type="select" label={t("imports.filter")} className="w-full sm:w-50" onChange={handleFilterImports}>
                        <option value={ImportStatus.ALL}>{t("imports.filterOptions.all")}</option>
                        <option value={ImportStatus.COMPLETED}>{t("imports.filterOptions.completed")}</option>
                        <option value={ImportStatus.PENDING}>{t("imports.filterOptions.pending")}</option>
                        <option value={ImportStatus.FAILED}>{t("imports.filterOptions.failed")}</option>
                    </Input>
                </div>
                {!isLoadingImports && totalItems === 0 ? (
                    <ImportsEmpty onCtaClick={toggle} />
                ) : (
                    <div className="min-h-0 flex-1 sm:flex-none">
                        <ImportsTable
                            imports={currentImports}
                            mobileScrollable
                            isLoading={isLoadingImports}
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
