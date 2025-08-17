import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "¡Hola! Soy tu asistente especializado en delitos informáticos. Puedo ayudarte con información sobre investigaciones, técnicas de análisis, normativas legales y más. ¿En qué puedo asistirte?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chatbot/message", { message: inputValue });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || "Lo siento, no pude procesar tu mensaje. Intenta de nuevo.",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error("Error en la comunicación");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Lo siento, hay un problema de conexión. Por favor intenta de nuevo más tarde.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-2rem)]">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <MessageCircle className="w-8 h-8 mr-3 text-green-600" />
          Asistente Virtual
        </h2>
        <p className="text-gray-600">
          Especializado en delitos informáticos y ciberseguridad
        </p>
      </div>

      <Card className="h-[calc(100%-8rem)] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <Bot className="w-5 h-5 mr-2 text-green-600" />
            Chat de Consultas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Área de mensajes */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.isUser
                          ? 'bg-blue-600 ml-3'
                          : 'bg-green-600 mr-3'
                      }`}
                    >
                      {message.isUser ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Mensaje */}
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de escritura */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Área de entrada */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <Input
                data-testid="input-chat-message"
                placeholder="Escribe tu consulta sobre delitos informáticos..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                data-testid="button-send-message"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Presiona Enter para enviar • Shift+Enter para nueva línea
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}