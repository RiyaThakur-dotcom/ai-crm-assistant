import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GenerateReplyRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useReplies() {
  return useQuery({
    queryKey: [api.replies.list.path],
    queryFn: async () => {
      const res = await fetch(api.replies.list.path);
      if (!res.ok) throw new Error("Failed to fetch replies");
      return api.replies.list.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateReply() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: GenerateReplyRequest) => {
      // Validate input before sending using the schema from routes if possible, 
      // otherwise trust the server or basic client checks
      const res = await fetch(api.replies.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate reply");
      }
      
      return api.replies.generate.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSaveReply() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { originalMessage: string; generatedReply: string; platform: 'whatsapp' | 'instagram' }) => {
      const res = await fetch(api.replies.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save reply");
      return api.replies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.replies.list.path] });
      toast({
        title: "Saved!",
        description: "Reply has been added to your history.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the reply.",
        variant: "destructive",
      });
    },
  });
}
