import { ImportStatus } from "@/lib/types/types";
import { PiChartBarHorizontalLight, PiSealWarningBold } from "react-icons/pi";
import { FaBarsProgress } from "react-icons/fa6";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

type CardProps = {
    status: ImportStatus;
    numberOfImports?: number;
};

function Card({ status, numberOfImports }: CardProps) {
    const getIcon = () => {
        switch (status) {
            case ImportStatus.ALL:
                return <PiChartBarHorizontalLight />;
            case ImportStatus.PENDING:
                return <FaBarsProgress />;
            case ImportStatus.FAILED:
                return <PiSealWarningBold />;
            case ImportStatus.COMPLETED:
                return <IoCheckmarkDoneOutline />
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-md shadow p-6 border-custom">
            {getIcon()}
            <h2 className="text-lg font-semibold mt-4">{numberOfImports}</h2>
            <span className="text-gray-500">{status}</span>
        </div>
    );
}

export default Card;