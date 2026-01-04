import { MessageCircle, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  value: "whatsapp" | "instagram";
  onChange: (value: "whatsapp" | "instagram") => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="flex gap-4 w-full">
      <button
        onClick={() => onChange("whatsapp")}
        className={cn(
          "flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
          value === "whatsapp"
            ? "border-[hsl(var(--whatsapp))] bg-[hsl(var(--whatsapp))]/5 shadow-md shadow-[hsl(var(--whatsapp))]/10"
            : "border-transparent bg-white shadow-sm hover:border-[hsl(var(--whatsapp))]/30 hover:bg-[hsl(var(--whatsapp))]/5 text-muted-foreground"
        )}
      >
        <div className={cn(
          "p-2 rounded-full transition-colors",
          value === "whatsapp" ? "bg-[hsl(var(--whatsapp))] text-white" : "bg-gray-100 text-gray-500"
        )}>
          <MessageCircle className="w-5 h-5" />
        </div>
        <span className={cn(
          "font-semibold text-lg",
          value === "whatsapp" ? "text-[hsl(var(--whatsapp))]" : "text-gray-600"
        )}>
          WhatsApp
        </span>
      </button>

      <button
        onClick={() => onChange("instagram")}
        className={cn(
          "flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
          value === "instagram"
            ? "border-[hsl(var(--instagram))] bg-[hsl(var(--instagram))]/5 shadow-md shadow-[hsl(var(--instagram))]/10"
            : "border-transparent bg-white shadow-sm hover:border-[hsl(var(--instagram))]/30 hover:bg-[hsl(var(--instagram))]/5 text-muted-foreground"
        )}
      >
        <div className={cn(
          "p-2 rounded-full transition-colors",
          value === "instagram" ? "bg-[hsl(var(--instagram))] text-white" : "bg-gray-100 text-gray-500"
        )}>
          <Instagram className="w-5 h-5" />
        </div>
        <span className={cn(
          "font-semibold text-lg",
          value === "instagram" ? "text-[hsl(var(--instagram))]" : "text-gray-600"
        )}>
          Instagram
        </span>
      </button>
    </div>
  );
}
