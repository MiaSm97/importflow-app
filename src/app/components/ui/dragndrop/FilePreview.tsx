import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { TiDeleteOutline } from "react-icons/ti";
import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";

type FilePreviewProps = {
    file: File;
    onRemove?: () => void;
    onDownload?: () => void;
    styles: Record<string, string>;
    children?: React.ReactNode;
    className?: string;
    date?: string;
};

function FilePreview({ file, onRemove, styles, children, className, date, onDownload }: FilePreviewProps) {
    const [isImage, setIsImage] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [dataURL, setDataURL] = useState("");

    const isFileInstance = (file: File): file is File => {
        return file instanceof File;
    };

    const getExt = (filename: string) => filename.split(".").pop() || "";

    const checkIsImage = (ext: string): boolean => ["jpeg", "jpg", "bmp", "png", "gif", "svg"].includes(ext.toLowerCase());

    useEffect(() => {
        if (isFileInstance(file)) {
            // Convert the file to data URL only for local preview rendering.
            const reader = new FileReader();
            reader.onloadend = function () {
                const result = reader.result;
                setDataURL(result as string);
                setIsLoaded(true);
            };
            reader.readAsDataURL(file);
            setIsImage(checkIsImage(getExt(file.name)));

            return () => {
                if (reader.readyState === FileReader.LOADING) {
                    reader.abort();
                }
            };
        }
    }, [file]);

    const truncate = (text: string) => (text.length >= 20 ? text.slice(0, 20) + "..." : text);

    return (
        <>
            {isLoaded && (
                <div className={`${styles.fileItem} flex flex-row ${className ?? ''}`}>
                    {isImage ? (
                        <div className="flex items-center">
                            <img src={dataURL} alt="preview" style={{ height: "30px", width: '30px', marginRight: '5px' }} />
                            <div className="flex flex-col">
                                {date &&
                                    <span className="text-start text-[12px] text-textGray">
                                        {date}
                                    </span>
                                }
                                <span className={styles.fileName}>
                                    {truncate(file.name)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <HiOutlineClipboardDocumentCheck className="w-4 h-4" />
                            <div className="flex flex-col">
                                {date &&
                                    <span className="text-start text-[12px] text-textGray">
                                        {date}
                                    </span>
                                }
                                <span className={styles.fileName}>
                                    {truncate(file.name)}
                                </span>
                            </div>
                        </div>
                    )}
                    {onRemove &&
                        <TiDeleteOutline className="w-4 h-4 cursor-pointer ml-4" onClick={onRemove} />
                    }
                    {onDownload &&
                        <div className={styles.downloadFileButton} onClick={onDownload}>
                            <FiDownload />
                        </div>
                    }
                    <div className="flex items-center">
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}

export default FilePreview;
