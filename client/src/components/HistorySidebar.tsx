import { useReplies } from "@/hooks/use-replies";
import { MessageCircle, Instagram, Clock, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  onSelect?: (reply: { originalMessage: string; generatedReply: string; platform: string }) => void;
}

export function HistorySidebar({ onSelect }: HistorySidebarProps) {
  const { data: replies, isLoading } = useReplies();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReplies = replies?.filter(reply => 
    reply.originalMessage.toLowerCase().includes(searchTerm.toLowerCase()) || 
    reply.generatedReply.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-border h-full flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          History
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 rounded-lg text-sm border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading history...</p>
          </div>
        ) : !replies?.length ? (
          <div className="text-center py-10 px-6">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-medium mb-1">No history yet</h3>
            <p className="text-sm text-muted-foreground">Generated replies will appear here automatically.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredReplies?.map((reply, i) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect?.(reply)}
                className="group relative bg-white border border-border/60 hover:border-primary/50 hover:shadow-md rounded-xl p-4 cursor-pointer transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                    reply.platform === 'whatsapp' 
                      ? "bg-[hsl(var(--whatsapp))]/10 text-[hsl(var(--whatsapp))]" 
                      : "bg-[hsl(var(--instagram))]/10 text-[hsl(var(--instagram))]"
                  )}>
                    {reply.platform === 'whatsapp' ? <MessageCircle className="w-3 h-3" /> : <Instagram className="w-3 h-3" />}
                    {reply.platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-foreground font-medium line-clamp-2 mb-1">
                  "{reply.originalMessage}"
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 pl-2 border-l-2 border-primary/20">
                  {reply.generatedReply}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
