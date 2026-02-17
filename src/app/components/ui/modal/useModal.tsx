import { useState } from "react";

export default function useModal() {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => {
        // Single toggle API keeps modal state transitions predictable.
        setIsOpen((prev) => !prev);
    };

    return {
        isOpen,
        toggle,
    };
}
