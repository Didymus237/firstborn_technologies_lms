"use client";

import { useChat } from "@ai-sdk/react";
import { useAuth } from "@/hooks/AuthProvider";
import { getBaseURL } from "@/lib/api";
import { toast } from "sonner";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  Minimize2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { user } = useAuth();
  
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: getBaseURL() + "/chatbot/query",
      credentials: "include",
    }),
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hi ${user?.name || "there"}! I'm Firstborn Technologies AI Assistant. How can I help you today?`
      } as any
    ],
    onError: (err: any) => {
      console.error("Chatbot hook error:", err);
    }
  } as any);

  const { messages, sendMessage, status } = chat;
  const isLoading = status === 'submitted' || status === 'streaming';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "bg-white dark:bg-[#121212] border dark:border-gray-800 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden mb-4",
          isMinimized ? "w-72 h-14" : "w-[380px] h-[550px] max-h-[80vh]"
        )}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#8B1E1E] to-[#b32727] text-white flex items-center justify-between shadow-lg relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-10 -mb-4 w-16 h-16 bg-black opacity-10 rounded-full blur-lg mix-blend-overlay"></div>

            <div className="relative flex items-center gap-3 z-10 w-full pr-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-100 to-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/20 shrink-0">
                <Sparkles className="w-5 h-5 text-[#8B1E1E]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm leading-tight text-white drop-shadow-sm truncate">Firstborn Technologies</h3>
                <h4 className="font-medium text-xs text-rose-100/90 leading-tight truncate">AI Assistant</h4>
                <p className="text-[10px] text-white/80 mt-0.5 flex items-center gap-1 font-medium tracking-wide">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"></span>
                  </span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-white/10"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
                {messages.map((m) => (
                  <div key={m.id} className={cn(
                    "flex flex-col",
                    m.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                        "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                        m.role === 'user' 
                          ? "bg-[#8B1E1E] text-white rounded-tr-none" 
                          : "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-none border dark:border-gray-800"
                    )}>
                       {(m as any).parts && (m as any).parts.length > 0 ? (
                         (m as any).parts.map((p: any, i: number) => (
                           p.type === 'text' ? <p key={i} className="whitespace-pre-wrap">{p.text}</p> : null
                         ))
                       ) : (
                         <p className="whitespace-pre-wrap">{(m as any).content}</p>
                       )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-2xl rounded-tl-none border dark:border-gray-800">
                      <Loader2 className="w-4 h-4 animate-spin text-[#8B1E1E]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t dark:border-gray-800 bg-white dark:bg-[#121212]">
                 <form 
                   onSubmit={(e) => {
                     e.preventDefault();
                     if (!inputValue.trim() || isLoading) return;
                     (sendMessage as any)({ text: inputValue });
                     setInputValue("");
                   }} 
                   className="flex gap-2"
                 >
                    <input 
                       className="flex-1 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm outline-none border border-transparent focus:border-[#8B1E1E]/30 dark:text-white transition-all"
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       placeholder="Type a message..."
                    />
                    <Button 
                      disabled={isLoading || !inputValue.trim()}
                      type="submit" 
                      size="icon"
                      className="bg-[#8B1E1E] text-white hover:bg-[#6a1515] shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                 </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center p-0 overflow-hidden group",
          isOpen ? "bg-white text-[#8B1E1E] border border-gray-200" : "bg-[#8B1E1E] text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />}
      </Button>
    </div>
  );
}
