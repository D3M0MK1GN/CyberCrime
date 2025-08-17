import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  X, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";
import { CaseModal } from "./CaseModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CyberCase } from "@shared/schema";

interface CasesResponse {
  cases: CyberCase[];
  total: number;
}

interface FilterState {
  search: string;
  crimeType: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  limit: number;
}

const CRIME_TYPES = [
  "Hacking",
  "Phishing", 
  "Malware",
  "Ransomware",
  "Fraude cibernético",
  "Robo de identidad",
  "Ciberacoso",
  "Suplantación de identidad",
];

const BADGE_COLORS = {
  crimeType: {
    "Hacking": "badge-hacking",
    "Phishing": "badge-phishing",
    "Malware": "badge-malware",
    "Ransomware": "badge-ransomware",
    "Fraude cibernético": "badge-fraud",
    "Robo de identidad": "badge-identity",
    "Ciberacoso": "badge-harassment",
    "Suplantación de identidad": "badge-impersonation",
  },
  status: {
    "Pendiente": "badge-pending",
    "En proceso": "badge-processing",
    "Completado": "badge-completed",
    "Sin respuesta": "badge-no-response",
    "Rechazado": "badge-rejected",
  }
} as const;

export function DataManagementOptimized() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCase, setEditCase] = useState<CyberCase | null>(null);
  const [filters, setFilters] = useState<FilterState>({
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cyber-cases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cyber-cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Éxito", description: "Caso eliminado correctamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el caso", variant: "destructive" });
    },
  });

  const updateFilter = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, ...(key !== 'page' && { page: 1 }) }));
  };

  const clearFilters = () => {
    setFilters({ search: "", crimeType: "", dateFrom: "", dateTo: "", page: 1, limit: 10 });
  };

  const openEditModal = (caseData: CyberCase) => {
    setModalOpen(false); // Asegurar que esté cerrado primero
    setTimeout(() => {
      setEditCase(caseData);
      setModalOpen(true);
    }, 50);
  };

  const viewCase = (caseData: CyberCase) => {
    // Para visualizar el caso, abrimos el modal en modo lectura
    setModalOpen(false); // Asegurar que esté cerrado primero
    setTimeout(() => {
      setEditCase({ ...caseData, readOnly: true } as any);
      setModalOpen(true);
    }, 50);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditCase(null);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este caso?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getBadgeColor = (type: 'crimeType' | 'status', value: string) => {
    return BADGE_COLORS[type][value as keyof typeof BADGE_COLORS[typeof type]] || "badge-rejected";
  };

  const totalPages = Math.ceil((casesData?.total || 0) / filters.limit);
  const hasResults = casesData && casesData.cases.length > 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
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
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
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
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold matrix-text">[ GESTIÓN DE DATOS ]</h2>
          <p className="text-muted-foreground">Sistema de administración de delitos informáticos</p>
        </div>
        <Button data-testid="button-new-case" onClick={() => setModalOpen(true)} className="mt-4 sm:mt-0 neon-button">
          <Plus className="w-4 h-4 mr-2" />
          NUEVO CASO
        </Button>
      </div>

      {/* Filters */}
      <Card className="neon-border">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-primary" />
              <Input
                data-testid="input-search"
                placeholder="Buscar por expediente..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10 terminal-input"
              />
            </div>

            <Select value={filters.crimeType || "todos"} onValueChange={(value) => updateFilter("crimeType", value === "todos" ? "" : value)}>
              <SelectTrigger data-testid="select-crime-type">
                <SelectValue placeholder="Tipo de delito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los delitos</SelectItem>
                {CRIME_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              data-testid="input-date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
              placeholder="Fecha desde"
              className="terminal-input"
            />

            <Input
              data-testid="input-date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
              placeholder="Fecha hasta"
              className="terminal-input"
            />
          </div>

          <div className="mt-4">
            <Button data-testid="button-clear" variant="outline" onClick={clearFilters} className="neon-button">
              <X className="w-4 h-4 mr-2" />
              LIMPIAR FILTROS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="neon-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full hacker-table">
              <thead className="border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">FECHA</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">N° EXPEDIENTE</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">DELITO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">VÍCTIMA</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">ESTADO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">MONTO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!hasResults ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      &gt;&gt; NO SE ENCONTRARON CASOS EN EL SISTEMA &lt;&lt;
                    </td>
                  </tr>
                ) : (
                  casesData.cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-primary/5 transition-all duration-200">
                      <td className="px-6 py-4 text-sm text-foreground font-mono">
                        {formatDate(caseItem.caseDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-primary font-mono">
                          #{caseItem.expedientNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getBadgeColor('crimeType', caseItem.crimeType)}>
                          {caseItem.crimeType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate font-mono">
                        {caseItem.victim}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getBadgeColor('status', caseItem.investigationStatus)}>
                          {caseItem.investigationStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-accent font-mono">
                        {formatCurrency(caseItem.stolenAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          <Button
                            data-testid={`button-view-${caseItem.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => viewCase(caseItem)}
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            data-testid={`button-edit-${caseItem.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(caseItem)}
                            className="text-accent hover:text-accent/80 hover:bg-accent/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            data-testid={`button-delete-${caseItem.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(caseItem.id)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
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
          {hasResults && totalPages > 1 && (
            <div className="bg-secondary px-6 py-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground font-mono">
                &gt;&gt; MOSTRANDO {((filters.page - 1) * filters.limit) + 1}-{Math.min(filters.page * filters.limit, casesData.total)} DE {casesData.total} REGISTROS
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  data-testid="button-prev-page"
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter("page", filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="neon-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  ANTERIOR
                </Button>
                <span className="text-sm text-primary font-mono">
                  [ {filters.page} / {totalPages} ]
                </span>
                <Button
                  data-testid="button-next-page"
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter("page", filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="neon-button"
                >
                  SIGUIENTE
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CaseModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingCase={editCase}
      />
    </div>
  );
}