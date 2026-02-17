type LoadDataProps = {
  className?: string;
};

function LoadData({ className = "" }: LoadDataProps) {
  return <div className={`animate-pulse rounded bg-bgBtnSecondary ${className}`} />;
}

export default LoadData;
