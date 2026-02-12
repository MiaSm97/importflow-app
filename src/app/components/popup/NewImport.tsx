import { useTranslations } from "next-intl";
import Input from "../ui/input/Input";
import { useState } from "react";
import { ALLOWED_EXTENSIONS_BY_TYPE, Delimiter, Import, ImportType, MAX_FILE } from "@/lib/types/types";
import DragNDrop from "../ui/dragndrop/DragNDrop";
import { useMenu } from "@/lib/context/MenuContext";
import Button from "../ui/button/Button";
import { isFileTypeValid } from "@/lib/commonFunctions";

type NewImportProps = {
    toggle: () => void;
    onCreate: (createdImport: Import) => void;
}

function NewImport({ toggle, onCreate }: NewImportProps) {
    const t = useTranslations();
    const { toastAlert } = useMenu();
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

    const createImport = () => {
        if (!name.trim()) {
            toastAlert(t("imports.new.nameError"));
            return;
        }
        if (files.length === 0) {
            toastAlert(t("imports.new.fileError"));
            return;
        }

        const newImport: Import = {
            id: crypto.randomUUID(),
            name,
            type,
            status: "completed", // For demo purposes, we set it to completed directly
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        const raw = localStorage.getItem("imports");
        const current = raw ? JSON.parse(raw) : [];
        localStorage.setItem("imports", JSON.stringify([newImport, ...current]));
        onCreate(newImport);

        toggle();

    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-[18px] font-bold px-4">{t("imports.buttons.new")}</h1>
            <Input label={t("imports.new.name")} value={name} onChange={(e) => setName(e.target.value)} className="px-4 border-t-custom pt-8" classNameInput="w-full" />
            <Input label={t('imports.new.type')} onChange={(e) => setType(e.target.value)} className="px-4" type="select" value={type} classNameInput="w-full">
                <option value={ImportType.CSV}>{ImportType.CSV}</option>
                <option value={ImportType.EXCEL}>{ImportType.EXCEL}</option>
                <option value={ImportType.XML}>{ImportType.XML}</option>
                <option value={ImportType.JSON}>{ImportType.JSON}</option>
            </Input>
            <div className="px-4 flex flex-col">
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
                <div className="px-4 flex flex-col">
                    <span className="text-textGray text-[12px]">{t("imports.new.csvHint")}</span>
                    <div className="flex gap-4">
                        <Input label={t("imports.new.comma")} type="radio" checked={delimiter === Delimiter.COMMA} onChange={() => setDelimiter(Delimiter.COMMA)} />
                        <Input label={t("imports.new.semicolon")} type="radio" checked={delimiter === Delimiter.SEMICOLON} onChange={() => setDelimiter(Delimiter.SEMICOLON)} />
                        <Input label={t("imports.new.Tab")} type="radio" checked={delimiter === Delimiter.TAB} onChange={() => setDelimiter(Delimiter.TAB)} />
                    </div>
                </div>
            )}
            <div className="border-t-custom flex gap-2 pt-6 px-4">
                <Button classname="w-full" label={t("imports.buttons.cancel")} type="secondary" onClick={toggle} />
                <Button classname="w-full" label={t("imports.buttons.create")} onClick={createImport} />
            </div>
        </div>
    )
}

export default NewImport;
