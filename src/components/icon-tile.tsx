import type { LucideIcon } from "lucide-react";

const TONES = {
  yellow: "bg-[#FFE66D]",
  coral: "bg-[#FF6B6B] text-white",
  teal: "bg-[#4ECDC4]",
  white: "bg-white",
};

export function IconTile({
  icon: Icon,
  tone = "yellow",
  className = "mb-5",
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-gray-800 text-gray-800 shadow-[4px_4px_0_#2D3748] ${TONES[tone]} ${className}`}
    >
      <Icon className="h-7 w-7" strokeWidth={2.25} aria-hidden="true" />
    </div>
  );
}
