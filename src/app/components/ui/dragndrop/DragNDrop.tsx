import { useRef, useState } from "react";
import styles from "./DragNDrop.module.css";
import FilePreview from "./FilePreview";
import { FiUpload } from "react-icons/fi";
// import add_icon from "@/app/assets/ic-add-w.svg";

type DragNDropProps = {
    title?: string;
    subtitle?: string;
    topText?: string;
    single?: boolean;
    maxFiles: number;
    files?: File[];
    multipleFilesErrorCallback?: () => void;
    removeFileCallback?: (removedFile: File) => void;
    addFileCallback?: (addedFile: File) => void;
};

function DragNDrop({
    title,
    subtitle,
    topText,
    single,
    maxFiles,
    files = [],
    multipleFilesErrorCallback,
    removeFileCallback,
    addFileCallback,
}: DragNDropProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue] = useState("");

    const hasMultipleError = (newFilesLength: number): boolean => {
        const length = files.length + newFilesLength;
        const singleError = single && length > 1;
        const multipleError = !single && Number.isInteger(maxFiles) && length > maxFiles;
        if (singleError || multipleError) {
            if (typeof multipleFilesErrorCallback == "function") {
                multipleFilesErrorCallback();
            }
            return true;
        }
        return false;
    };

    const addFile = (file: File) => {
        if (file == null) {
            return;
        }

        if (typeof addFileCallback === "function") {
            addFileCallback(file);
        }
    };

    const dragHandler = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
    };

    const dropHandler = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        if (hasMultipleError(e.dataTransfer.items.length)) {
            return;
        }
        for (const item of e.dataTransfer.items) {
            if (item.kind === "file") {
                const file = item.getAsFile();
                addFile(file as File);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files == null) return;

        const newFiles = Array.from(e.target.files);

        if (hasMultipleError(newFiles.length)) return;

        newFiles.forEach((file) => addFile(file));
    };

    return (
        <>
            {topText && <div className={styles.topText}>{topText}</div>}
            <div className={`${styles.dropField} cursor-pointer`} onDragOver={dragHandler} onDrop={dropHandler}>
                <input type="file" style={{ display: "none" }} ref={inputRef} value={inputValue} onChange={handleChange} multiple={!single} />
                <div className="flex items-center flex-col gap-4" onClick={() => inputRef?.current?.click()}>
                    <FiUpload className="w-8 h-8 text-textGray mt-6" />
                    {title && <div className={styles.title}>{title}</div>}
                    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                </div>
            </div>
            <div className={`${styles.filesPreview} text-left`}>
                {files.map((file, i) => (
                    <FilePreview key={i} file={file} styles={styles} onRemove={() => removeFileCallback!(file)} />
                ))}
            </div>
        </>
    );
}

export default DragNDrop;
