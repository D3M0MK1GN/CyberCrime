import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Edit,
  Check
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading, error } = useQuery({
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
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
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
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Error al cargar las estadísticas del dashboard</p>
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
      title: "Total de Casos",
      value: stats?.totalCases || 0,
      icon: FolderOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "+12%",
      changeText: "desde el mes pasado",
      changeColor: "text-green-600",
    },
    {
      title: "Monto Total",
      value: formatCurrency(stats?.totalAmount || 0),
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+8%",
      changeText: "desde el mes pasado",
      changeColor: "text-green-600",
    },
    {
      title: "Casos Activos",
      value: stats?.activeCases || 0,
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      change: "+3%",
      changeText: "desde la semana pasada",
      changeColor: "text-red-600",
    },
    {
      title: "Casos Resueltos",
      value: stats?.resolvedCases || 0,
      icon: CheckCircle,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "+15%",
      changeText: "desde el mes pasado",
      changeColor: "text-green-600",
    },
  ];

  const recentActivities = [
    {
      icon: Plus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Nuevo caso agregado #EXP-2024-0156",
      description: "Fraude electrónico - Monto: $45,000",
      time: "Hace 2 horas",
    },
    {
      icon: Check,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Caso resuelto #EXP-2024-0143",
      description: "Estafa bancaria - Recuperado: $12,500",
      time: "Hace 4 horas",
    },
    {
      icon: Edit,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Actualización de caso #EXP-2024-0134",
      description: "Nueva información de pesquisa agregada",
      time: "Hace 6 horas",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Control</h2>
        <p className="text-gray-600">Resumen de estadísticas y métricas del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`} className="text-3xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${stat.iconColor} text-xl`} size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-600 text-sm ml-2">{stat.changeText}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Casos por Mes</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-primary rounded-full"></span>
                <span className="text-sm text-gray-600">2024</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Gráfico de casos por mes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tipos de Delito</CardTitle>
              <button className="text-sm text-primary hover:underline">Ver todos</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {stats?.crimeTypeStats && stats.crimeTypeStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.crimeTypeStats.slice(0, 5).map((crime, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{crime.type}</span>
                      <span className="text-sm font-medium text-gray-900">{crime.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No hay datos de tipos de delito</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                    <Icon className={`${activity.iconColor} text-sm`} size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
