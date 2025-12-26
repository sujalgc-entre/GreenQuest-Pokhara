'use client';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";

export const POKHARA_WARDS = Array.from({ length: 33 }, (_, i) => `Ward ${i + 1}`);

export function WardSelector({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-full h-12 bg-black/20 border-white/10 text-white rounded-xl focus:ring-teal-500/50 focus:border-teal-500/50 ${className}`}>
        <SelectValue placeholder="Select your Ward" />
      </SelectTrigger>
      <SelectContent className="bg-[#0f172a] border-white/10 text-white max-h-[300px]">
        {POKHARA_WARDS.map((ward) => (
          <SelectItem 
            key={ward} 
            value={ward}
            className="focus:bg-teal-500/20 focus:text-teal-200 cursor-pointer"
          >
            {ward}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
