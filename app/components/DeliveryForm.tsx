import {
  Home as HomeIcon,
  Building,
  CheckCircle2,
} from "lucide-react";

interface Props {
  position: [number, number];

  landmark: string;
  setLandmark: (v: string) => void;

  buildingColor: string;
  setBuildingColor: (v: string) => void;

  gateSide: string;
  setGateSide: (v: string) => void;

  floor: string;
  setFloor: (v: string) => void;

  arrivalNote: string;
  setArrivalNote: (v: string) => void;

  saveHome: () => void;
  saveWork: () => void;

  actions: React.ReactNode;
}

export default function DeliveryForm({
  position,
  landmark,
  setLandmark,
  buildingColor,
  setBuildingColor,
  gateSide,
  setGateSide,
  floor,
  setFloor,
  arrivalNote,
  setArrivalNote,
  saveHome,
  saveWork,
  actions,
}: Props) {
  return (
    <div className="flex-1 bg-white rounded-t-3xl px-5 py-6 flex flex-col gap-5 overflow-y-auto shadow-2xl">
      {/* STATUS CARD */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle2 className="text-green-600 mt-1" />

        <div>
          <p className="font-bold text-black">
            Delivery Point Ready
          </p>

          <p className="text-sm text-gray-700">
            Drag the pin for exact rider stop point.
          </p>
        </div>
      </div>

      {/* COORDINATES */}
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">
          Coordinates
        </p>

        <p className="text-black font-bold text-lg">
          {position[0].toFixed(5)},{" "}
          {position[1].toFixed(5)}
        </p>
      </div>

      {/* INPUTS */}
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nearby landmark"
          value={landmark}
          onChange={(e) =>
            setLandmark(e.target.value)
          }
          className="border border-gray-300 text-black p-4 rounded-2xl outline-none"
        />

        <input
          type="text"
          placeholder="Building color"
          value={buildingColor}
          onChange={(e) =>
            setBuildingColor(e.target.value)
          }
          className="border border-gray-300 text-black p-4 rounded-2xl outline-none"
        />

        <input
          type="text"
          placeholder="Entrance / gate side"
          value={gateSide}
          onChange={(e) =>
            setGateSide(e.target.value)
          }
          className="border border-gray-300 text-black p-4 rounded-2xl outline-none"
        />

        <input
          type="text"
          placeholder="Floor / apartment"
          value={floor}
          onChange={(e) =>
            setFloor(e.target.value)
          }
          className="border border-gray-300 text-black p-4 rounded-2xl outline-none"
        />

        <textarea
          placeholder="Arrival note for rider..."
          value={arrivalNote}
          onChange={(e) =>
            setArrivalNote(e.target.value)
          }
          className="border border-gray-300 text-black p-4 rounded-2xl outline-none min-h-[120px]"
        />
      </div>

      {/* SAVE BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={saveHome}
          className="flex-1 border border-gray-300 py-4 rounded-2xl flex items-center justify-center gap-2 text-black font-semibold"
        >
          <HomeIcon size={18} />
          Save Home
        </button>

        <button
          onClick={saveWork}
          className="flex-1 border border-gray-300 py-4 rounded-2xl flex items-center justify-center gap-2 text-black font-semibold"
        >
          <Building size={18} />
          Save Work
        </button>
      </div>

      {actions}
    </div>
  );
}