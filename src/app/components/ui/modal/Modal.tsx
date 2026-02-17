interface ModalProps {
    children?: React.ReactNode;
    isOpen?: boolean;
    className?: string;
}

function Modal({ children, isOpen, className = '' }: ModalProps) {
    return (
        <>
            {(isOpen) && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bgPopup p-3 sm:items-center sm:p-6">
                    <div
                        // Prevent clicks inside modal content from bubbling to the overlay.
                        onClick={(e) => e.stopPropagation()}
                        className={`${className} block w-full max-w-[680px] rounded-2xl bg-white shadow-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto sm:max-h-[calc(100vh-3rem)]`}
                    >
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}

export default Modal;
