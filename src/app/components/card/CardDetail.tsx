import Box from "../box/Box";

export type CardDetailProps = {
    color: string;
    label: string;
    data: string;
}

function CardDetail({ color, label, data }: CardDetailProps) {
    return (
        <Box classname="w-full flex flex-col items-center text-center">
            <p className="text-[12px] text-textGray">{label}</p>
            <span className='text-bold text-[22px]' style={{ color: color }}>{data}</span>
        </Box>
    );
}

export default CardDetail;