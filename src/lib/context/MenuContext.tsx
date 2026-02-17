"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import styles from "@/app/components/ui/Toast/Toast.module.css";
import Toast from "@/app/components/ui/Toast/Toast";
import { Import, MenuOptions } from "@/lib/types/types";
import { useTranslations } from "next-intl";
import {
    IMPORTS_REPOSITORY_LOCAL_MODE_EVENT,
    listImports,
} from "@/lib/data/importsRepository";

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
    removeImport: (id: string) => void;
    loadAllImports: () => Promise<void>;
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
    // Avoid duplicate informational toasts when repository falls back to local mode.
    const localModeToastShownRef = useRef(false);
    // Deduplicate concurrent full-load requests across consumers.
    const loadingAllImportsRef = useRef<Promise<void> | null>(null);

    const addToast = useCallback((message: string, type: "alert" | "info") => {
        setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
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
    const removeImport = useCallback((id: string) => {
        setImports((prev) => prev.filter((item) => item.id !== id));
    }, []);
    const loadAllImports = useCallback(async () => {
        if (importsLoaded) {
            return;
        }

        if (loadingAllImportsRef.current) {
            // Reuse in-flight request instead of triggering another fetch.
            await loadingAllImportsRef.current;
            return;
        }

        const loadingPromise = (async () => {
            showLoader();
            try {
                const currentImports = await listImports();
                setImports(currentImports);
                setImportsLoaded(true);
            } finally {
                hideLoader();
                loadingAllImportsRef.current = null;
            }
        })();

        loadingAllImportsRef.current = loadingPromise;
        await loadingPromise;
    }, [hideLoader, importsLoaded, showLoader]);
    const isLoading = loadingCount > 0;

    useEffect(() => {
        const onLocalMode = () => {
            if (localModeToastShownRef.current) {
                return;
            }

            localModeToastShownRef.current = true;
            toastInfo(t("imports.repository.localMode"));
        };

        window.addEventListener(IMPORTS_REPOSITORY_LOCAL_MODE_EVENT, onLocalMode);
        return () => {
            window.removeEventListener(IMPORTS_REPOSITORY_LOCAL_MODE_EVENT, onLocalMode);
        };
    }, [t, toastInfo]);

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
            removeImport,
            loadAllImports,
        }),
        [optionsMenu, toastAlert, toastInfo, isLoading, showLoader, hideLoader, imports, importsLoaded, addImport, removeImport, loadAllImports]
    );

    return (
        <MenuContext.Provider value={contextValue}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </MenuContext.Provider>
    );
};

export default MenuProvider;
