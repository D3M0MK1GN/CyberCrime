import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  X, 
  Download, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CaseModal } from "./CaseModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CyberCase } from "@shared/schema";

interface CasesResponse {
  cases: CyberCase[];
  total: number;
}

export function DataManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CyberCase | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    crimeType: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 10,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: casesData, isLoading, error } = useQuery<CasesResponse>({
    queryKey: ["/api/cyber-cases", filters],
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cyber-cases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cyber-cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Éxito",
        description: "Caso eliminado correctamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo eliminar el caso",
        variant: "destructive",
      });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      crimeType: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
      limit: 10,
    });
  };

  const handleEditCase = (caseData: CyberCase) => {
    setEditingCase(caseData);
    setIsModalOpen(true);
  };

  const handleDeleteCase = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este caso?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCase(null);
  };

  const getCrimeTypeBadgeColor = (type: string) => {
    const colors = {
      "Hacking": "bg-red-100 text-red-800",
      "Phishing": "bg-orange-100 text-orange-800",
      "Malware": "bg-purple-100 text-purple-800",
      "Ransomware": "bg-gray-100 text-gray-800",
      "Fraude cibernético": "bg-blue-100 text-blue-800",
      "Robo de identidad": "bg-yellow-100 text-yellow-800",
      "Ciberacoso": "bg-pink-100 text-pink-800",
      "Suplantación de identidad": "bg-indigo-100 text-indigo-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getInvestigationStatusBadge = (status: string) => {
    const statusMap = {
      "Pendiente": "bg-yellow-100 text-yellow-800",
      "En proceso": "bg-blue-100 text-blue-800",
      "Completado": "bg-green-100 text-green-800",
      "Sin respuesta": "bg-red-100 text-red-800",
      "Rechazado": "bg-gray-100 text-gray-800",
    };
    return statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const totalPages = Math.ceil((casesData?.total || 0) / filters.limit);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Error al cargar los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Datos</h2>
          <p className="text-gray-600">Administre todos los casos de delitos informáticos</p>
        </div>
        <Button
          data-testid="button-new-case"
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevos Datos
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Input
                  id="search"
                  data-testid="input-search"
                  placeholder="Buscar por expediente, delito..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="crimeType">Tipo de Delito</Label>
              <Select
                value={filters.crimeType}
                onValueChange={(value) => handleFilterChange("crimeType", value)}
              >
                <SelectTrigger data-testid="select-crime-type">
                  <SelectValue placeholder="Todos los delitos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los delitos</SelectItem>
                  <SelectItem value="Hacking">Hacking</SelectItem>
                  <SelectItem value="Phishing">Phishing</SelectItem>
                  <SelectItem value="Malware">Malware</SelectItem>
                  <SelectItem value="Ransomware">Ransomware</SelectItem>
                  <SelectItem value="Fraude cibernético">Fraude cibernético</SelectItem>
                  <SelectItem value="Robo de identidad">Robo de identidad</SelectItem>
                  <SelectItem value="Ciberacoso">Ciberacoso</SelectItem>
                  <SelectItem value="Suplantación de identidad">Suplantación de identidad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                id="dateFrom"
                data-testid="input-date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                id="dateTo"
                data-testid="input-date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button data-testid="button-clear" variant="outline" onClick={handleClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
            <Button data-testid="button-export" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    N° de Expediente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Delito
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Víctima
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Monto Sustraído
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!casesData?.cases || casesData.cases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron casos que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  casesData.cases.map((caseItem: CyberCase) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(caseItem.caseDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-primary">
                          {caseItem.expedientNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCrimeTypeBadgeColor(caseItem.crimeType)}>
                          {caseItem.crimeType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{caseItem.victim}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Badge className={getInvestigationStatusBadge(caseItem.investigationStatus)}>
                          {caseItem.investigationStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(caseItem.stolenAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex space-x-1">
                          <Button
                            data-testid={`button-edit-${caseItem.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCase(caseItem)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            data-testid={`button-delete-${caseItem.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCase(caseItem.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(casesData?.total ?? 0) > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-medium text-gray-900 mx-1">
                  {((filters.page - 1) * filters.limit) + 1}-{Math.min(filters.page * filters.limit, casesData?.total || 0)}
                </span>{" "}
                de{" "}
                <span className="font-medium text-gray-900 ml-1">{casesData?.total || 0}</span>{" "}
                resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  data-testid="button-prev-page"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={filters.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {filters.page} de {totalPages}
                </span>
                <Button
                  data-testid="button-next-page"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page >= totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingCase={editingCase}
      />
    </div>
  );
}
