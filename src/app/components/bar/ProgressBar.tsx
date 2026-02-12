import { ImportStatus } from "@/lib/types/types";
import type { CSSProperties } from "react";
import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
    progress?: number;
    status: ImportStatus;
};

type ProgressStyle = CSSProperties & {
    "--progress-color": string;
};

function ProgressBar({ progress, status }: ProgressBarProps) {
    const getColor = () => {
        switch (status) {
            case ImportStatus.COMPLETED:
                return "#10B981";
            case ImportStatus.FAILED:
                return "#F87171";
            case ImportStatus.PENDING:
                return "#FBBF24";
            default:
                return "#D1D5DB";
        }
    };

    const progressStyle: ProgressStyle = { "--progress-color": getColor() };

    return <progress className={styles.progress} style={progressStyle} value={progress ?? (status === ImportStatus.COMPLETED ? 100 : 0)} max={100} />;
}

export default ProgressBar;
