import { PiDownloadDuotone } from "react-icons/pi";
import { AiTwotoneDelete } from "react-icons/ai";
import { getImportFileDownload } from "@/lib/data/importsRepository";
import { useTranslations } from "next-intl";
import { useMenu } from "@/lib/context/MenuContext";
import { Import } from "@/lib/types/types";
import React from "react";

type ActionsProps = {
    importItem?: Import;
    toggle: () => void;
    setImport?: React.Dispatch<Import | undefined>;
}

function Actions({ importItem, toggle, setImport }: ActionsProps) {
    const t = useTranslations();
    const { toastAlert } = useMenu();

    const handleDownloadImportFile = async () => {
        if (!importItem) {
            return;
        }

        const file = await getImportFileDownload(importItem.id);
        if (!file) {
            toastAlert(t("imports.detail.fileUnavailable"));
            return;
        }

        try {
            if (file.url.startsWith("data:")) {
                const link = document.createElement("a");
                link.href = file.url;
                link.download = file.fileName || `${importItem.name}.dat`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            const response = await fetch(file.url);
            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = file.fileName || `${importItem.name}.dat`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        } catch {
            toastAlert(t("imports.detail.downloadError"));
        }
    };

    return (
        <div className='flex items-center gap-4 self-start sm:self-auto'>
            <AiTwotoneDelete
                className='h-5 w-5 cursor-pointer sm:h-[22px] sm:w-[22px]'
                onClick={(event) => {
                    event.stopPropagation();
                    if (importItem) {
                        setImport?.(importItem);
                    }
                    toggle();
                }}
            />
            <PiDownloadDuotone
                className='h-5 w-5 cursor-pointer sm:h-[22px] sm:w-[22px]'
                onClick={(event) => {
                    event.stopPropagation();
                    void handleDownloadImportFile();
                }}
            />
        </div>
    );
}

export default Actions;
