import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Edit,
  Check,
  Users,
  FileText,
  Bot,
  ArrowLeft
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { UserAdministration } from "./UserAdministration";
import { ReportAdministration } from "./ReportAdministration";
import { ChatbotAdministration } from "./ChatbotAdministration";

export function Dashboard() {
  const [currentView, setCurrentView] = useState<"main" | "users" | "reports" | "chatbot">("main");
  const { toast } = useToast();

  const { data: stats, isLoading, error } = useQuery<{
    totalCases: number;
    totalAmount: string;
    activeCases: number;
    resolvedCases: number;
    crimeTypeStats: { type: string; count: number }[];
  }>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="neon-border">
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="text-center py-12">
          <p className="text-destructive">Error al cargar las estadísticas del dashboard</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const statCards = [
    {
      title: "TOTAL DE CASOS",
      value: stats?.totalCases || 0,
      icon: FolderOpen,
      iconColor: "text-primary",
      change: "+12%",
      changeText: "desde el mes pasado",
      changeColor: "text-accent",
    },
    {
      title: "MONTO TOTAL",
      value: formatCurrency(stats?.totalAmount || 0),
      icon: DollarSign,
      iconColor: "text-accent",
      change: "+8%",
      changeText: "desde el mes pasado",
      changeColor: "text-accent",
    },
    {
      title: "CASOS ACTIVOS",
      value: stats?.activeCases || 0,
      icon: AlertTriangle,
      iconColor: "text-destructive",
      change: "+3%",
      changeText: "desde la semana pasada",
      changeColor: "text-destructive",
    },
    {
      title: "CASOS RESUELTOS",
      value: stats?.resolvedCases || 0,
      icon: CheckCircle,
      iconColor: "text-primary",
      change: "+15%",
      changeText: "desde el mes pasado",
      changeColor: "text-accent",
    },
  ];

  const recentActivities = [
    {
      icon: Plus,
      iconColor: "text-primary",
      title: "NUEVO CASO AGREGADO #EXP-2024-0156",
      description: "FRAUDE ELECTRÓNICO - MONTO: $45,000",
      time: "HACE 2 HORAS",
    },
    {
      icon: Check,
      iconColor: "text-accent",
      title: "CASO RESUELTO #EXP-2024-0143",
      description: "ESTAFA BANCARIA - RECUPERADO: $12,500",
      time: "HACE 4 HORAS",
    },
    {
      icon: Edit,
      iconColor: "text-muted-foreground",
      title: "ACTUALIZACIÓN DE CASO #EXP-2024-0134",
      description: "NUEVA INFORMACIÓN DE PESQUISA AGREGADA",
      time: "HACE 6 HORAS",
    },
  ];

  // Renderizar las diferentes vistas
  if (currentView === "users") {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="mb-6">
          <Button
            onClick={() => setCurrentView("main")}
            variant="outline"
            className="font-mono neon-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            VOLVER AL DASHBOARD
          </Button>
        </div>
        <UserAdministration />
      </div>
    );
  }

  if (currentView === "reports") {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="mb-6">
          <Button
            onClick={() => setCurrentView("main")}
            variant="outline"
            className="font-mono neon-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            VOLVER AL DASHBOARD
          </Button>
        </div>
        <ReportAdministration />
      </div>
    );
  }

  if (currentView === "chatbot") {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="mb-6">
          <Button
            onClick={() => setCurrentView("main")}
            variant="outline"
            className="font-mono neon-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            VOLVER AL DASHBOARD
          </Button>
        </div>
        <ChatbotAdministration />
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold matrix-text mb-2">DASHBOARD DE CONTROL</h1>
        <p className="text-muted-foreground font-mono">Sistema de gestión de delitos informáticos</p>
      </div>

      {/* Botones de acceso a secciones administrativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="neon-border theme-card hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => setCurrentView("users")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold matrix-text font-mono">ADMINISTRACIÓN</h3>
                <p className="text-sm text-muted-foreground font-mono">DE USUARIOS</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="neon-border theme-card hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => setCurrentView("reports")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold matrix-text font-mono">ADMINISTRACIÓN</h3>
                <p className="text-sm text-muted-foreground font-mono">DE PLANILLAS</p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="neon-border theme-card hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => setCurrentView("chatbot")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold matrix-text font-mono">ADMINISTRACIÓN</h3>
                <p className="text-sm text-muted-foreground font-mono">DE CHATBOT</p>
              </div>
              <Bot className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="neon-border theme-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-mono">{stat.title}</p>
                    <p data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`} className="text-3xl font-bold text-foreground font-mono">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center neon-border">
                    <Icon className={`${stat.iconColor} text-xl`} size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium font-mono ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2 font-mono">{stat.changeText}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="neon-border theme-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="matrix-text font-mono">[ CASOS POR MES ]</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-primary rounded-full"></span>
                <span className="text-sm text-muted-foreground font-mono">2024</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground font-mono">&gt;&gt; GRÁFICO DE CASOS POR MES &lt;&lt;</p>
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border theme-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="matrix-text font-mono">[ TIPOS DE DELITO ]</CardTitle>
              <button className="text-sm text-primary hover:text-primary/80 font-mono">VER TODOS</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {stats?.crimeTypeStats && stats.crimeTypeStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.crimeTypeStats.slice(0, 5).map((crime, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border border-border/50">
                      <span className="text-sm text-foreground font-mono">{crime.type}</span>
                      <span className="text-sm font-medium text-primary font-mono">[{crime.count}]</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground font-mono">&gt;&gt; NO HAY DATOS DISPONIBLES &lt;&lt;</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="neon-border theme-card">
        <CardHeader>
          <CardTitle className="matrix-text font-mono">[ ACTIVIDAD RECIENTE ]</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-4 p-4 rounded border border-border/50 hover:bg-primary/5 transition-colors">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center neon-border">
                    <Icon className={`${activity.iconColor}`} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground font-mono">{activity.title}</p>
                    <p className="text-sm text-muted-foreground font-mono">{activity.description}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}