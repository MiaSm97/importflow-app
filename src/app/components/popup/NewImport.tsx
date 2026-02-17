import { useTranslations } from "next-intl";
import Input from "../ui/input/Input";
import { useState } from "react";
import { ALLOWED_EXTENSIONS_BY_TYPE, Delimiter, ImportStatus, ImportType, MAX_FILE } from "@/lib/types/types";
import DragNDrop from "../ui/dragndrop/DragNDrop";
import { useMenu } from "@/lib/context/MenuContext";
import Button from "../ui/button/Button";
import { isFileTypeValid } from "@/lib/commonFunctions";
import Box from "../box/Box";
import { createImport as createImportRecord } from "@/lib/data/importsRepository";

type NewImportProps = {
    toggle: () => void;
}

function NewImport({ toggle }: NewImportProps) {
    const t = useTranslations();
    const { toastAlert, showLoader, hideLoader, addImport } = useMenu();
    const [name, setName] = useState('');
    const [type, setType] = useState<ImportType>(ImportType.CSV);
    const [files, setFiles] = useState<File[]>([]);
    const [delimiter, setDelimiter] = useState<Delimiter>(Delimiter.COMMA);

    const addFile = (file: File) => {
        if (!isFileTypeValid(file, type)) {
            toastAlert(
                t("imports.new.fileTypeError", {
                    type,
                    allowed: ALLOWED_EXTENSIONS_BY_TYPE[type].join(", "),
                })
            );
            return;
        }

        if (files.length >= MAX_FILE) {
            toastAlert(t("imports.new.noMoreFiles", { numberFiles: MAX_FILE }));
            return;
        }
        setFiles(prev => [...prev, file]);
    }

    const removeFile = (file: File) => setFiles(prev => prev.filter(f => f !== file));

    const handleCreateImport = async () => {
        if (!name.trim()) {
            toastAlert(t("imports.new.nameError"));
            return;
        }
        if (files.length === 0) {
            toastAlert(t("imports.new.fileError"));
            return;
        }

        showLoader();
        try {
            const createdImport = await createImportRecord({
                name,
                type,
                status: ImportStatus.COMPLETED, // For demo purposes, we set it to completed directly
                progress: 100,
            });
            addImport(createdImport);
            toggle();
        } finally {
            hideLoader();
        }

    }

    return (
        <Box classname="flex border-none! px-0! flex-col gap-5 sm:gap-6">
            <h1 className="px-4 text-[18px] font-bold sm:px-6">{t("imports.buttons.new")}</h1>
            <Input label={t("imports.new.name")} value={name} onChange={(e) => setName(e.target.value)} className="border-t-custom px-4 pt-6 sm:px-6 sm:pt-8" classNameInput="w-full" />
            <Input label={t('imports.new.type')} onChange={(e) => {
                console.log(e)
                setType(e.target.value as ImportType)}} className="px-4 sm:px-6" type="select" value={type} classNameInput="w-full">
                <option value={ImportType.CSV}>{ImportType.CSV}</option>
                <option value={ImportType.EXCEL}>{ImportType.EXCEL}</option>
                <option value={ImportType.XML}>{ImportType.XML}</option>
                <option value={ImportType.JSON}>{ImportType.JSON}</option>
            </Input>
            <div className="flex flex-col px-4 sm:px-6">
                <span className="text-textGray text-[12px]">{t("imports.new.upload")}</span>
                <DragNDrop
                    removeFileCallback={removeFile}
                    files={files}
                    addFileCallback={addFile}
                    multipleFilesErrorCallback={() =>
                        toastAlert(t("imports.new.noMoreFiles", { numberFiles: MAX_FILE }))
                    }
                    title={t('imports.new.dragndrop')}
                    subtitle={t('imports.new.dragndropHint')}
                    maxFiles={MAX_FILE} />
            </div>
            {type === ImportType.CSV && (
                <div className="flex flex-col px-4 sm:px-6">
                    <span className="text-textGray text-[12px]">{t("imports.new.csvHint")}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <Input label={t("imports.new.comma")} type="radio" checked={delimiter === Delimiter.COMMA} onChange={() => setDelimiter(Delimiter.COMMA)} />
                        <Input label={t("imports.new.semicolon")} type="radio" checked={delimiter === Delimiter.SEMICOLON} onChange={() => setDelimiter(Delimiter.SEMICOLON)} />
                        <Input label={t("imports.new.Tab")} type="radio" checked={delimiter === Delimiter.TAB} onChange={() => setDelimiter(Delimiter.TAB)} />
                    </div>
                </div>
            )}
            <div className="border-t-custom flex flex-col-reverse gap-2 px-4 pb-4 pt-5 sm:flex-row sm:px-6 sm:pb-0 sm:pt-6">
                <Button classname="w-full" label={t("imports.buttons.cancel")} type="secondary" onClick={toggle} />
                <Button classname="w-full" label={t("imports.buttons.create")} onClick={handleCreateImport} />
            </div>
        </Box>
    )
}

export default NewImport;