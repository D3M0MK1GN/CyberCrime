import { useState, useMemo, useCallback, useEffect } from "react";
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
  page: number;
  totalPages: number;
}

// Use debounced search to reduce API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const CRIME_TYPES = [
  "Hacking", "Phishing", "Malware", "Ransomware", 
  "Fraude cibernético", "Robo de identidad", "Ciberacoso", "Suplantación de identidad"
];

const BADGE_COLORS = {
  crimeType: {
    "Hacking": "bg-red-500/20 text-red-400 border-red-500/30",
    "Phishing": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Malware": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Ransomware": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "Fraude cibernético": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Robo de identidad": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Ciberacoso": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "Suplantación de identidad": "bg-green-500/20 text-green-400 border-green-500/30",
  },
  status: {
    "Pendiente": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "En proceso": "bg-blue-500/20 text-blue-400 border-blue-500/30", 
    "Completado": "bg-green-500/20 text-green-400 border-green-500/30",
    "Sin respuesta": "bg-gray-500/20 text-gray-400 border-gray-500/30",
    "Rechazado": "bg-red-500/20 text-red-400 border-red-500/30",
  }
} as const;

export function DataManagementFast() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCase, setEditCase] = useState<CyberCase | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [crimeType, setCrimeType] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 300);
  
  const limit = 20; // Items per page

  // Build query key for caching
  const queryKey = useMemo(() => [
    "/api/cyber-cases", 
    currentPage, 
    limit, 
    debouncedSearch, 
    crimeType, 
    dateFrom, 
    dateTo
  ], [currentPage, limit, debouncedSearch, crimeType, dateFrom, dateTo]);

  // Fetch cases with optimized query
  const { data, isLoading, error } = useQuery<CasesResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(crimeType !== "todos" && { crimeType }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });
      
      const response = await fetch(`/api/cyber-cases?${params}`);
      if (!response.ok) throw new Error('Failed to fetch cases');
      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
  });

  // Optimized mutations
  const createMutation = useMutation({
    mutationFn: (newCase: any) =>
      apiRequest("/api/cyber-cases", "POST", newCase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cyber-cases"] });
      toast({ title: "Caso creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear caso", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/cyber-cases/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cyber-cases"] });
      toast({ title: "Caso actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar caso", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/cyber-cases/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cyber-cases"] });
      toast({ title: "Caso eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar caso", variant: "destructive" });
    }
  });

  // Optimized handlers
  const handleCreateCase = useCallback((caseData: any) => {
    createMutation.mutate(caseData);
    setModalOpen(false);
    setEditCase(null);
  }, [createMutation]);

  const handleEditCase = useCallback((caseData: any) => {
    if (!editCase?.id) return;
    updateMutation.mutate({ id: editCase.id, data: caseData });
    setModalOpen(false);
    setEditCase(null);
  }, [editCase?.id, updateMutation]);

  const handleDeleteCase = useCallback((id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este caso?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCrimeType("todos");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }, []);

  // Memoized components for performance
  const CaseRow = useMemo(() => ({ cyberCase }: { cyberCase: CyberCase }) => (
    <tr key={cyberCase.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
      <td className="p-3 font-mono text-sm">{cyberCase.expedientNumber}</td>
      <td className="p-3">
        <Badge className={`${BADGE_COLORS.crimeType[cyberCase.crimeType as keyof typeof BADGE_COLORS.crimeType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} font-mono text-xs`}>
          {cyberCase.crimeType}
        </Badge>
      </td>
      <td className="p-3 font-mono text-sm max-w-xs truncate">{cyberCase.victim}</td>
      <td className="p-3 font-mono text-sm">${cyberCase.stolenAmount?.toLocaleString() || "0"}</td>
      <td className="p-3">
        <Badge className={`${BADGE_COLORS.status[cyberCase.investigationStatus as keyof typeof BADGE_COLORS.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} font-mono text-xs`}>
          {cyberCase.investigationStatus}
        </Badge>
      </td>
      <td className="p-3 font-mono text-sm">{cyberCase.caseDate}</td>
      <td className="p-3">
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditCase(cyberCase);
              setModalOpen(true);
            }}
            className="h-8 w-8 p-0 neon-border"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 neon-border"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteCase(cyberCase.id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  ), [handleDeleteCase]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive font-mono">Error al cargar casos</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Recargar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold matrix-text font-mono">[ GESTIÓN DE CASOS ]</h2>
          <p className="text-muted-foreground font-mono">Sistema de casos de delitos informáticos</p>
        </div>
        <Button
          onClick={() => {
            setEditCase(null);
            setModalOpen(true);
          }}
          className="neon-border font-mono"
        >
          <Plus className="w-4 h-4 mr-2" />
          NUEVO CASO
        </Button>
      </div>

      {/* Filters */}
      <Card className="neon-border theme-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar casos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={crimeType} onValueChange={setCrimeType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de delito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {CRIME_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Desde"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Hasta"
            />
            <Button onClick={resetFilters} variant="outline" className="font-mono">
              LIMPIAR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card className="neon-border theme-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="p-3 text-left font-mono text-sm">EXPEDIENTE</th>
                      <th className="p-3 text-left font-mono text-sm">DELITO</th>
                      <th className="p-3 text-left font-mono text-sm">DESCRIPCIÓN</th>
                      <th className="p-3 text-left font-mono text-sm">MONTO</th>
                      <th className="p-3 text-left font-mono text-sm">ESTADO</th>
                      <th className="p-3 text-left font-mono text-sm">FECHA</th>
                      <th className="p-3 text-left font-mono text-sm">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.cases.map((cyberCase) => (
                      <CaseRow key={cyberCase.id} cyberCase={cyberCase} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border/20">
                  <div className="text-sm text-muted-foreground font-mono">
                    {data.cases.length} de {data.total} casos
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="font-mono"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-mono">
                      {currentPage} / {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                      disabled={currentPage === data.totalPages}
                      className="font-mono"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <CaseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditCase(null);
        }}
        onSubmit={editCase ? handleEditCase : handleCreateCase}
        initialData={editCase}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}