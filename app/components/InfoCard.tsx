interface Props {
  title: string;
  value: string;
}

export default function InfoCard({
  title,
  value,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
      <p className="text-white/50 text-sm mb-1">
        {title}
      </p>

      <p className="font-semibold text-white">
        {value || "N/A"}
      </p>
    </div>
  );
}