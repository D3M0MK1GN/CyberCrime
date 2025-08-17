import { useState } from "react";
import { Bot, Settings, MessageSquare, TrendingUp, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface ChatbotConfig {
  isActive: boolean;
  welcomeMessage: string;
  maxResponseLength: number;
  responseDelay: number;
  enableLearning: boolean;
  logConversations: boolean;
}

interface Conversation {
  id: string;
  usuario: string;
  mensaje: string;
  respuesta: string;
  fecha: string;
  calificacion?: number;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    usuario: "María González",
    mensaje: "¿Cómo analizar un caso de phishing?",
    respuesta: "El phishing es una técnica de ingeniería social donde los atacantes se hacen pasar por entidades confiables...",
    fecha: "2025-01-16 22:44",
    calificacion: 5
  },
  {
    id: "2",
    usuario: "Carlos Rodríguez",
    mensaje: "Información sobre malware bancario",
    respuesta: "Para casos de malware en delitos informáticos: 1. Aísla el sistema infectado 2. Captura evidencia forense...",
    fecha: "2025-01-16 22:45",
    calificacion: 4
  },
  {
    id: "3",
    usuario: "Admin Sistema",
    mensaje: "Hola",
    respuesta: "Hola, soy tu asistente especializado en delitos informáticos. He recibido tu consulta...",
    fecha: "2025-01-16 22:45"
  }
];

export function ChatbotAdministration() {
  const [config, setConfig] = useState<ChatbotConfig>({
    isActive: true,
    welcomeMessage: "¡Hola! Soy tu asistente especializado en delitos informáticos. Puedo ayudarte con información sobre investigaciones, técnicas de análisis, normativas legales y más. ¿En qué puedo asistirte?",
    maxResponseLength: 500,
    responseDelay: 1000,
    enableLearning: true,
    logConversations: true
  });
  
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [newResponse, setNewResponse] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const { toast } = useToast();

  const handleSaveConfig = () => {
    // Aquí se guardaría la configuración en el backend
    toast({
      title: "Configuración guardada",
      description: "Los cambios en el chatbot han sido aplicados exitosamente",
    });
  };

  const handleAddResponse = () => {
    if (!newKeyword || !newResponse) {
      toast({
        title: "Error",
        description: "Palabra clave y respuesta son obligatorias",
        variant: "destructive",
      });
      return;
    }

    // Simular agregado de nueva respuesta
    toast({
      title: "Respuesta agregada",
      description: `Nueva respuesta agregada para "${newKeyword}"`,
    });
    
    setNewKeyword("");
    setNewResponse("");
  };

  const stats = {
    totalConversations: conversations.length,
    averageRating: conversations.filter(c => c.calificacion).reduce((acc, c) => acc + (c.calificacion || 0), 0) / conversations.filter(c => c.calificacion).length,
    responseRate: 100, // Porcentaje de respuestas exitosas
    activeUsers: new Set(conversations.map(c => c.usuario)).size
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold matrix-text font-mono">ADMINISTRACIÓN DE CHATBOT</h2>
          <p className="text-muted-foreground font-mono">Configuración y monitoreo del asistente virtual</p>
        </div>
        <Button onClick={handleSaveConfig} className="neon-border font-mono">
          <Save className="w-4 h-4 mr-2" />
          GUARDAR CONFIGURACIÓN
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              CONVERSACIONES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold matrix-text">{stats.totalConversations}</div>
          </CardContent>
        </Card>
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              CALIFICACIÓN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.averageRating.toFixed(1)}/5
            </div>
          </CardContent>
        </Card>
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">TASA RESPUESTA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.responseRate}%</div>
          </CardContent>
        </Card>
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">USUARIOS ACTIVOS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{stats.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="font-mono">CONFIGURACIÓN</TabsTrigger>
          <TabsTrigger value="responses" className="font-mono">RESPUESTAS</TabsTrigger>
          <TabsTrigger value="logs" className="font-mono">CONVERSACIONES</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card className="neon-border theme-card">
            <CardHeader>
              <CardTitle className="flex items-center font-mono">
                <Settings className="w-5 h-5 mr-2" />
                CONFIGURACIÓN DEL CHATBOT
              </CardTitle>
              <CardDescription>
                Ajusta el comportamiento y parámetros del asistente virtual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={config.isActive}
                  onCheckedChange={(checked) => setConfig({...config, isActive: checked})}
                />
                <Label htmlFor="active" className="font-mono">CHATBOT ACTIVO</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome" className="font-mono">MENSAJE DE BIENVENIDA</Label>
                <Textarea
                  id="welcome"
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLength" className="font-mono">LONGITUD MÁXIMA RESPUESTA</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    value={config.maxResponseLength}
                    onChange={(e) => setConfig({...config, maxResponseLength: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay" className="font-mono">RETRASO RESPUESTA (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={config.responseDelay}
                    onChange={(e) => setConfig({...config, responseDelay: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="learning"
                  checked={config.enableLearning}
                  onCheckedChange={(checked) => setConfig({...config, enableLearning: checked})}
                />
                <Label htmlFor="learning" className="font-mono">HABILITAR APRENDIZAJE</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="logging"
                  checked={config.logConversations}
                  onCheckedChange={(checked) => setConfig({...config, logConversations: checked})}
                />
                <Label htmlFor="logging" className="font-mono">REGISTRAR CONVERSACIONES</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="neon-border theme-card">
            <CardHeader>
              <CardTitle className="font-mono">GESTIÓN DE RESPUESTAS</CardTitle>
              <CardDescription>
                Agrega y modifica respuestas automáticas del chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyword" className="font-mono">PALABRA CLAVE</Label>
                  <Input
                    id="keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Ej: ransomware, crypto, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono">RESPUESTA</Label>
                  <Textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Respuesta que dará el chatbot..."
                    className="min-h-20"
                  />
                </div>
              </div>
              <Button onClick={handleAddResponse} className="font-mono">
                AGREGAR RESPUESTA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="neon-border theme-card">
            <CardHeader>
              <CardTitle className="flex items-center font-mono">
                <Bot className="w-5 h-5 mr-2" />
                REGISTRO DE CONVERSACIONES
              </CardTitle>
              <CardDescription>
                Historial de interacciones con el chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">USUARIO</TableHead>
                    <TableHead className="font-mono">MENSAJE</TableHead>
                    <TableHead className="font-mono">RESPUESTA</TableHead>
                    <TableHead className="font-mono">FECHA</TableHead>
                    <TableHead className="font-mono">CALIFICACIÓN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell className="font-mono">{conv.usuario}</TableCell>
                      <TableCell className="font-mono max-w-xs truncate">{conv.mensaje}</TableCell>
                      <TableCell className="font-mono max-w-xs truncate">{conv.respuesta}</TableCell>
                      <TableCell className="font-mono">{conv.fecha}</TableCell>
                      <TableCell className="font-mono">
                        {conv.calificacion ? `${conv.calificacion}/5` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}