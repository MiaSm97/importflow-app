"use client";

import { createContext, useContext, useState } from "react";
import styles from "@/app/components/ui/Toast/Toast.module.css";
import Toast from "@/app/components/ui/Toast/Toast";
import { MenuOptions } from "@/lib/types/types";
import { useTranslations } from "next-intl";

type MenuContextProps = {
    optionsMenu: MenuOptions;
    setOptionsMenu: React.Dispatch<React.SetStateAction<MenuOptions>>;
    toastAlert: (message: string) => void;
    toastInfo: (message: string) => void;
};

type ToastType = {
    id: number;
    message: string;
    type: "alert" | "info";
};

const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error("useMenu must be used within a MenuProvider");
    }
    return context;
};

const MenuProvider = ({ children }: { children: React.ReactNode }) => {
    const t = useTranslations();
    const [optionsMenu, setOptionsMenu] = useState<MenuOptions>({
        title: t("app.name"),
    });
    const [toasts, setToasts] = useState<ToastType[]>([]);

    const addToast = (message: string, type: "alert" | "info") => setToasts((prev) => [...prev, { id: Date.now(), message, type }]);

    const toastAlert = (message: string) => addToast(message, "alert");
    const toastInfo = (message: string) => addToast(message, "info");
    const removeToast = (id: number) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

    return (
        <MenuContext.Provider value={{ optionsMenu, setOptionsMenu, toastAlert, toastInfo }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((toast, index) => (
                    <Toast key={index} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </MenuContext.Provider>
    );
};

export default MenuProvider;
