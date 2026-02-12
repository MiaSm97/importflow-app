import { Import } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import TablePages from "./TablePages";
import { useEffect, useState } from "react";
import { getColor } from "@/lib/commonFunctions";

function ImportsTable({ imports }: { imports: Import[] }) {
    const t = useTranslations();
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(imports.length / itemsPerPage));
    const paginatedImports = imports.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    return (
        <div className="flex flex-col border-custom rounded-md bg-white">
            <div className="flex w-full text-textGray border-b-custom p-4 pb-4">
                <span className="w-[25%]">{t("imports.table.name")}</span>
                <span className="w-[25%]">{t("imports.table.status")}</span>
                <span className="w-[25%]">{t("imports.table.progress")}</span>
                <span className="w-[25%]">{t("imports.table.updatedAt")}</span>
            </div>
            {paginatedImports.map((importItem) => (
                <div key={importItem.id} className="flex w-full items-center text-sm border-b-custom px-4 py-2">
                    <span className="w-[25%]">{importItem.name}</span>
                    <span className="w-[25%]">
                        <span
                            className="inline-flex w-[30%] rounded-md p-4"
                            style={{ backgroundColor: getColor(importItem.status) }}
                        >
                            {t(`imports.status.${importItem.status.toLowerCase()}`)}
                        </span>
                    </span>
                    <span className="w-[25%]">{`${importItem.progress ?? 100}%`}</span> {/* For demo purposes, we set progress to 100% directly */}
                    <span className="w-[25%]">{new Date(importItem.updatedAt).toLocaleString()}</span>
                </div>
            ))}
            <TablePages currentPage={page} totalPages={totalPages} onNextPageChange={() => setPage(prev => Math.min(totalPages, prev + 1))} onPreviousPageChange={() => setPage(prev => Math.max(1, prev - 1))} />
        </div>
    );
}

export default ImportsTable;
