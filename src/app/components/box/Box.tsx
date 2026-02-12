type BoxProps = {
    children: React.ReactNode;
    classname?: string;
};

function Box({ children, classname }: BoxProps) {
    return (
        <div className={`bg-white rounded-md p-6 border-custom ${classname || ''}`}>
            {children}
        </div>
    );
}

export default Box;