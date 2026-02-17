import { useRef } from "react";
import styles from "./DragNDrop.module.css";
import FilePreview from "./FilePreview";
import { FiUpload } from "react-icons/fi";

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

    const hasMultipleError = (newFilesLength: number): boolean => {
        const length = files.length + newFilesLength;
        const singleError = single && length > 1;
        const multipleError = !single && Number.isInteger(maxFiles) && length > maxFiles;
        if (singleError || multipleError) {
            // Keep validation side effects centralized in one place.
            if (typeof multipleFilesErrorCallback === "function") {
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
        // Validate the whole drop before reading file items one by one.
        if (hasMultipleError(e.dataTransfer.items.length)) {
            return;
        }
        for (const item of e.dataTransfer.items) {
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) {
                    addFile(file);
                }
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
                <input type="file" style={{ display: "none" }} ref={inputRef} onChange={handleChange} multiple={!single} />
                <div className="flex items-center flex-col gap-4" onClick={() => inputRef?.current?.click()}>
                    <FiUpload className="w-8 h-8 text-textGray mt-6" />
                    {title && <div className={styles.title}>{title}</div>}
                    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                </div>
            </div>
            <div className={`${styles.filesPreview} text-left`}>
                {files.map((file, i) => (
                    <FilePreview key={`${file.name}-${i}`} file={file} styles={styles} onRemove={removeFileCallback ? () => removeFileCallback(file) : undefined} />
                ))}
            </div>
        </>
    );
}

export default DragNDrop;
