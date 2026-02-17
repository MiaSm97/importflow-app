import { useEffect, useState } from "react";
import styles from "@/app/components/ui/Toast/Toast.module.css";
import { FiAlertTriangle } from "react-icons/fi";
import InfoIcon from "@/app/components/ui/icons/InfoIcon";

type ToastProps = {
    message: string;
    type: "alert" | "info";
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Start CSS fade-out slightly before unmounting for a smoother exit.
        const startFadeOut = setTimeout(() => setIsClosing(true), 4000);
        const autoClose = setTimeout(onClose, 4300);

        return () => {
            clearTimeout(startFadeOut);
            clearTimeout(autoClose);
        };
    }, [onClose]);

    return (
        <div className={`flex items-center gap-2 ${styles.toast} ${styles[type]} ${isClosing ? styles.fadeOut : ""}`}>
            <span className="">{type === "alert" ? <FiAlertTriangle /> : <InfoIcon />}</span>
            <span className="text-sm">{message}</span>
        </div>
    );
};

export default Toast;
