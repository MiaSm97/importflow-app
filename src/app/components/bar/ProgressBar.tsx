import { ImportStatus } from "@/lib/types/types";
import type { CSSProperties } from "react";
import styles from "./ProgressBar.module.css";
import { getColorImportStatus } from "@/lib/commonFunctions";

type ProgressBarProps = {
    progress?: number;
    status: ImportStatus;
};

type ProgressStyle = CSSProperties & {
    "--progress-color": string;
};

function ProgressBar({ progress, status }: ProgressBarProps) {
    // CSS custom property lets module CSS style pseudo-elements consistently.
    const progressStyle: ProgressStyle = { "--progress-color": getColorImportStatus(status) };

    return <progress className={styles.progress} style={progressStyle} value={progress ?? (status === ImportStatus.COMPLETED ? 100 : 0)} max={100} />;
}

export default ProgressBar;
