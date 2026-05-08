import { Copy, Send } from "lucide-react";

interface Props {
  onCopy: () => void;
  onShare: () => void;
}

export default function ActionButtons({
  onCopy,
  onShare,
}: Props) {
  return (
    <div className="flex gap-3 pb-5">
      <button
        onClick={onCopy}
        className="flex-1 border border-gray-300 py-4 rounded-2xl flex items-center justify-center gap-2 text-black font-bold"
      >
        <Copy size={18} />
        Copy
      </button>

      <button
        onClick={onShare}
        className="flex-1 bg-black text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold"
      >
        <Send size={18} />
        Share
      </button>
    </div>
  );
}