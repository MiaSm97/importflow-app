import React, { forwardRef } from "react";
import classes from "./Input.module.css";
import SearchIcon from "../icons/SearchIcon";

type InputChangeEvent = React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export type InputProps = {
    className?: string;
    type?: string;
    label?: string;
    required?: boolean;
    children?: React.ReactNode;
    name?: string;
    checked?: boolean;
    value?: string | number;
    multiple?: boolean;
    maxLength?: number;
    min?: string;
    max?: string;
    disable?: boolean;
    classNameInput?: string;
    placeholder?: string;
    step?: string;
    onInvalid?: (e: React.FormEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onChange?: (event: InputChangeEvent) => void;
};

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({

    className,
    type,
    label,
    required,
    children,
    name,
    checked,
    multiple,
    value,
    onChange = () => { },
    maxLength,
    min,
    max,
    step,
    placeholder,
    disable,
    classNameInput,
    onInvalid,
    onBlur,
}, ref) => {
    return (
        <label className={`flex flex-col text-textGray text-[12px] text-start ${className ?? ""}`}>
            {label && type !== "checkbox" && type !== "radio" && <span>{label}</span>}

            {type === "text-area" && (
                <textarea
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    name={name}
                    onChange={onChange}
                    className="text-black bg-white text-ellipsis rounded-lg border border-textGray outline-none py-2 px-3"
                    required={required}
                    disabled={disable}
                    placeholder={placeholder}
                />
            )}

            {type === 'date' && (
                <input
                    type="date"
                    onChange={onChange}
                    className={`text-black bg-white text-ellipsis rounded-lg border border-textGray outline-none py-2 px-3 ${classNameInput ?? ""}`}
                    required={required}
                    value={value}
                    disabled={disable}
                    name={name}
                    max={max}
                    min={min}
                />
            )}

            {type === "select" && (
                <select
                    name={name}
                    onChange={onChange}
                    className={`text-black bg-white text-ellipsis rounded-lg border border-textGray outline-none py-2 px-3 ${classNameInput ?? ""}`}
                    required={required}
                    multiple={multiple}
                    value={value}
                    disabled={disable}
                >
                    {children}
                </select>
            )}

            {type === "checkbox" && (
                <div className={`${classes.checkboxContainer} ${className}`}>
                    <span>{label}</span>
                    <label className={classes.checkbox}>
                        <input type="checkbox" checked={checked} onChange={onChange} required={required} />
                        <span className={classes.checkmark}></span>
                    </label>
                </div>
            )}

            {type === "radio" && (
                <div className={`${classes.radioContainer} ${className}`}>
                    <label className={classes.radio}>
                        <input type="radio" name={name} checked={checked} onChange={onChange} required={required} />
                        <span className={classes.radioMark}></span>
                        <span>{label}</span>
                    </label>
                </div>
            )}

            {type !== "text-area" && type !== "select" && type !== "checkbox" && type !== "radio" && type !== 'date' && (
                <div className="relative w-full">
                    {/* Shared default input branch (text, number, search, etc.). */}
                    <input
                        ref={ref as React.Ref<HTMLInputElement>}
                        name={name}
                        onChange={onChange}
                        className={`placeholder:text-[12px] bg-white h-7.5 text-black text-ellipsis rounded-lg border border-textGray outline-none py-2 ${type === "search" ? "pl-6" : "pl-3"} pr-3 ${classNameInput ?? ""}`}
                        type={type ?? "text"}
                        required={required}
                        maxLength={maxLength}
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onInvalid={onInvalid}
                        onBlur={onBlur}
                        disabled={disable}
                        placeholder={placeholder}
                    />
                    {type === "search" && (
                        // Icon is absolutely positioned so the input padding stays consistent.
                        <div className="absolute top-1.25 left-1">
                            {SearchIcon()}
                        </div>
                    )}
                </div>
            )}
        </label>
    );
});

export default Input;
