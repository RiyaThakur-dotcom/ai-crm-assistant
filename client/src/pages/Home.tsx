import { useState } from "react";
import { HistorySidebar } from "@/components/HistorySidebar";
import { PlatformSelector } from "@/components/PlatformSelector";
import { useGenerateReply, useSaveReply } from "@/hooks/use-replies";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ArrowRight, Bot, Zap, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Home() {
  const [platform, setPlatform] = useState<"whatsapp" | "instagram">("whatsapp");
  const [message, setMessage] = useState("");
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const generateMutation = useGenerateReply();
  const saveMutation = useSaveReply();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!message.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a customer message first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        message,
        platform,
      });
      setGeneratedReply(result.reply);
    } catch (error) {
      // Error handling is managed in the hook
    }
  };

  const handleCopy = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Reply copied to clipboard.",
      });
    }
  };

  const handleSave = async () => {
    if (generatedReply) {
      try {
        await saveMutation.mutateAsync({
          originalMessage: message,
          generatedReply,
          platform,
        });
        // Reset state after saving to encourage next interaction
        setMessage("");
        setGeneratedReply(null);
      } catch (error) {
        // Error handling in hook
      }
    }
  };

  const loadFromHistory = (reply: { originalMessage: string; generatedReply: string; platform: string }) => {
    setMessage(reply.originalMessage);
    setGeneratedReply(reply.generatedReply);
    setPlatform(reply.platform as "whatsapp" | "instagram");
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-secondary/30 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 transform md:transform-none transition-transform duration-300 ease-in-out z-30 h-full",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <HistorySidebar onSelect={loadFromHistory} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Header */}
        <header className="h-16 border-b border-border bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
              AI CRM Assistant
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>Powered by GPT-4o</span>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Input Section */}
            <section className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  Generate the perfect reply
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Paste a customer message below and let AI craft a friendly, human-like response in seconds.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-black/[0.02] border border-border/50">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground ml-1 uppercase tracking-wider text-xs opacity-70">
                      Platform
                    </label>
                    <PlatformSelector value={platform} onChange={setPlatform} />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground ml-1 uppercase tracking-wider text-xs opacity-70">
                      Customer Message
                    </label>
                    <div className="relative group">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., Hi, I'm interested in your premium plan but I need to know if it includes API access?"
                        className="w-full min-h-[160px] p-4 md:p-6 rounded-2xl bg-secondary/30 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none resize-none text-base md:text-lg transition-all duration-200 placeholder:text-muted-foreground/50"
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-medium bg-white/80 backdrop-blur px-2 py-1 rounded-md border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        {message.length} chars
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !message.trim()}
                    className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300"
                  >
                    {generateMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Crafting Reply...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Reply</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </section>

            {/* Result Section */}
            <AnimatePresence mode="wait">
              {generatedReply && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-display font-bold text-foreground">Generated Reply</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="rounded-lg hover:bg-secondary/80 border-border/60"
                      >
                        {saveMutation.isPending ? "Saving..." : "Save to History"}
                      </Button>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-2xl border-2 border-primary/10 shadow-lg shadow-primary/5 p-6 md:p-8 overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                    
                    <p className="text-lg md:text-xl leading-relaxed text-foreground whitespace-pre-wrap relative z-10">
                      {generatedReply}
                    </p>

                    <div className="mt-8 pt-6 border-t border-border flex justify-end gap-3">
                      <Button
                        onClick={handleCopy}
                        className={cn(
                          "transition-all duration-300 min-w-[140px]",
                          isCopied 
                            ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25 shadow-md" 
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                        )}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" /> Copy Text
                          </>
                        )}
                      </Button>
                      
                      <a 
                        href={platform === 'whatsapp' ? 'https://web.whatsapp.com/' : 'https://instagram.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-foreground text-white hover:bg-foreground/90 shadow-lg shadow-black/10">
                          Open {platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  );
}
