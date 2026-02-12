import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import Button from "../ui/button/Button";

type TablePagesProps = {
    currentPage: number;
    totalPages: number;
    onNextPageChange: () => void;
    onPreviousPageChange: () => void;
};

function TablePages({ currentPage, totalPages, onNextPageChange, onPreviousPageChange }: TablePagesProps) {
    return (
        <div className="flex items-center justify-end gap-2 p-4">
            <Button type="secondary" classname="rounded border-custom px-3 py-1 disabled:opacity-50" leftIcon={<IoIosArrowBack />} onClick={() => onPreviousPageChange()} isDisabled={currentPage === 1} />
            <span className="text-sm rounded-md p-1 bg-black text-white">{currentPage} / {totalPages}</span>
            <Button type="secondary" classname="rounded border-custom px-3 py-1 disabled:opacity-50" leftIcon={<IoIosArrowForward />} onClick={() => onNextPageChange()} isDisabled={currentPage === totalPages} />
        </div>
    );
}

export default TablePages;