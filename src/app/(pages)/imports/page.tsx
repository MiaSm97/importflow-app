'use client';

import ImportsTable from "@/app/components/imports-table/ImportsTable";
import NewImport from "@/app/components/popup/NewImport";
import Button from "@/app/components/ui/button/Button";
import Input from "@/app/components/ui/input/Input";
import Modal from "@/app/components/ui/modal/Modal";
import useModal from "@/app/components/ui/modal/useModal";
import { handleExportImports } from "@/lib/commonFunctions";
import { Import, ImportStatus } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CiExport } from "react-icons/ci";

export default function ImportsPage() {
    const t = useTranslations();
    const { isOpen, toggle } = useModal();

    const [imports, setImports] = useState<Import[]>([]);
    const [filteredImports, setFilteredImports] = useState<Import[]>([]);
    const [filter, setFilter] = useState<ImportStatus>(ImportStatus.ALL);

    const handleFilterImports = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as ImportStatus;
        setFilter(value);
    }

    const handleCreateImport = (createdImport: Import) => {
        setImports((prev) => [createdImport, ...prev]);
    };

    useEffect(() => {
        const raw = localStorage.getItem("imports");
        const currentImports = raw ? JSON.parse(raw) : [];
        setImports(currentImports);
    }, []);

    useEffect(() => {
        if (filter === ImportStatus.ALL) {
            setFilteredImports(imports);
        } else {
            setFilteredImports(imports.filter(i => i.status === filter));
        }
    }, [imports, filter]);

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-[22px] font-bold">{t("imports.title")}</h1>
                    <div className="flex w-full gap-2 sm:w-auto">
                        <Button classname="flex-1 sm:flex-none" type="secondary" leftIcon={<CiExport />} label={t("imports.buttons.export")} isDisabled={filteredImports.length === 0} onClick={() => handleExportImports(filteredImports)} />
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
                <ImportsTable imports={filteredImports} />
            </div>
            <Modal className="px-0" isOpen={isOpen}>
                <NewImport toggle={toggle} onCreate={handleCreateImport} />
            </Modal>
        </>
    );
}
