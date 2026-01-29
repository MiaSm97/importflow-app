import { useEffect, useState } from "react";
import styles from "@/app/components/ui/Toast/Toast.module.css";
import AlertIcon from "@/app/components/ui/icons/AlertIcon";
import InfoIcon from "@/app/components/ui/icons/InfoIcon";

type ToastProps = {
    message: string;
    type: "alert" | "info";
    onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const startFadeOut = setTimeout(() => setIsClosing(true), 4000); // fade-out dopo 4 secondi
        const autoClose = setTimeout(onClose, 4300); // rimuovo i toast dal dom dopo 4.3 secondi

        return () => {
            clearTimeout(startFadeOut);
            clearTimeout(autoClose);
        };
    }, [onClose]);

    return (
        <div className={`flex items-center gap-2 ${styles.toast} ${styles[type]} ${isClosing ? styles.fadeOut : ""}`}>
            <span className="">{type === "alert" ? <AlertIcon /> : <InfoIcon />}</span>
            <span className="text-sm">{message}</span>
        </div>
    );
};

export default Toast;
