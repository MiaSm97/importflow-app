"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import styles from "@/app/components/ui/Toast/Toast.module.css";
import Toast from "@/app/components/ui/Toast/Toast";
import { Import, MenuOptions } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import { listImports } from "@/lib/data/importsRepository";
import { useEffect } from "react";

type MenuContextProps = {
    optionsMenu: MenuOptions;
    setOptionsMenu: React.Dispatch<React.SetStateAction<MenuOptions>>;
    toastAlert: (message: string) => void;
    toastInfo: (message: string) => void;
    isLoading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
    imports: Import[];
    importsLoaded: boolean;
    addImport: (newImport: Import) => void;
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
    const [loadingCount, setLoadingCount] = useState(0);
    const [imports, setImports] = useState<Import[]>([]);
    const [importsLoaded, setImportsLoaded] = useState(false);

    const addToast = useCallback((message: string, type: "alert" | "info") => {
        setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const toastAlert = useCallback((message: string) => addToast(message, "alert"), [addToast]);
    const toastInfo = useCallback((message: string) => addToast(message, "info"), [addToast]);
    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    const showLoader = useCallback(() => setLoadingCount((prev) => prev + 1), []);
    const hideLoader = useCallback(() => setLoadingCount((prev) => Math.max(0, prev - 1)), []);
    const addImport = useCallback((newImport: Import) => {
        setImports((prev) => [newImport, ...prev]);
    }, []);
    const isLoading = loadingCount > 0;

    useEffect(() => {
        let isMounted = true;

        const loadInitialImports = async () => {
            showLoader();
            try {
                const currentImports = await listImports();
                if (isMounted) {
                    setImports(currentImports);
                }
            } finally {
                if (isMounted) {
                    setImportsLoaded(true);
                }
                hideLoader();
            }
        };

        loadInitialImports();

        return () => {
            isMounted = false;
        };
    }, [hideLoader, showLoader]);

    const contextValue = useMemo(
        () => ({
            optionsMenu,
            setOptionsMenu,
            toastAlert,
            toastInfo,
            isLoading,
            showLoader,
            hideLoader,
            imports,
            importsLoaded,
            addImport,
        }),
        [optionsMenu, toastAlert, toastInfo, isLoading, showLoader, hideLoader, imports, importsLoaded, addImport]
    );

    return (
        <MenuContext.Provider value={contextValue}>
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
