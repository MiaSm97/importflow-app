
import type { ReactNode } from "react";

type ButtonProps = {
    label?: string;
    classname?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    type?: "primary" | "secondary";
    isDisabled?: boolean;
    onClick: () => void;
};

function Button({ label, classname, isDisabled, onClick, leftIcon, rightIcon, type = "primary" }: ButtonProps) {
    return (
        <button
            className={`${classname || ""} ${type === "primary" ? "bg-black text-white" : "bg-white border-custom"} cursor-pointer inline-flex items-center justify-center gap-2 p-2 rounded-md text-center disabled:opacity-50`}
            disabled={isDisabled}
            onClick={onClick}
        >
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {label && <span>{label}</span>}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </button>
    );
}

export default Button;
