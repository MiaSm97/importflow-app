interface ModalProps {
    children?: React.ReactNode;
    isOpen?: boolean;
    className?: string;
}

function Modal({ children, isOpen, className = '' }: ModalProps) {
    return (
        <>
            {(isOpen) && (
                <div className={`z-50 w-full h-screen fixed top-0 left-0 bg-bgPopup flex justify-center items-center overflow-auto`} >
                    <div onClick={(e) => e.stopPropagation()} className={`${className} block bg-white max-w-125 w-[40%] p-7.5 rounded-2xl overflow-visible`}>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}

export default Modal;

