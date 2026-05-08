import { MapPinned, Navigation } from "lucide-react";

interface Props {
  onLocate: () => void;
}

export default function Header({ onLocate }: Props) {
  return (
    <div className="bg-white border-b px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MapPinned className="text-black" />

        <h1 className="text-2xl font-black text-black">
          LocateMe
        </h1>
      </div>

      <button
        onClick={onLocate}
        className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
      >
        <Navigation size={18} />
        Locate
      </button>
    </div>
  );
}