function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
            <div className="flex items-center gap-3 rounded-md bg-white px-4 py-3 shadow">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-textGray border-t-black" />
                <span className="text-sm text-textGray">Loading...</span>
            </div>
        </div>
    );
}

export default Loading;