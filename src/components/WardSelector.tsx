export const POKHARA_WARDS = Array.from({ length: 33 }, (_, i) => `Ward ${i + 1}`);

export function WardSelector({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 border border-zinc-300 rounded-md bg-white text-zinc-900 focus:ring-2 focus:ring-green-500 outline-none ${className}`}
    >
      <option value="" disabled>Select Ward</option>
      {POKHARA_WARDS.map((ward) => (
        <option key={ward} value={ward}>
          {ward}
        </option>
      ))}
    </select>
  );
}
