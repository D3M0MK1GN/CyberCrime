import { useState } from "react";
import { FileText, Download, Calendar, Filter, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  nombre: string;
  tipo: "Resumen Mensual" | "Análisis de Casos" | "Estadísticas" | "Reporte Personalizado";
  fechaCreacion: string;
  creadoPor: string;
  estado: "Generado" | "En Proceso" | "Error";
  formato: "PDF" | "Excel" | "CSV";
  tamaño: string;
}

const mockReports: Report[] = [
  {
    id: "1",
    nombre: "Resumen Delitos Informáticos Enero 2025",
    tipo: "Resumen Mensual",
    fechaCreacion: "2025-01-15",
    creadoPor: "Admin Sistema",
    estado: "Generado",
    formato: "PDF",
    tamaño: "2.4 MB"
  },
  {
    id: "2",
    nombre: "Análisis Casos Phishing Q1 2025",
    tipo: "Análisis de Casos",
    fechaCreacion: "2025-01-14",
    creadoPor: "María González",
    estado: "Generado", 
    formato: "Excel",
    tamaño: "1.8 MB"
  },
  {
    id: "3",
    nombre: "Estadísticas Generales Sistema",
    tipo: "Estadísticas",
    fechaCreacion: "2025-01-13",
    creadoPor: "Carlos Rodríguez",
    estado: "En Proceso",
    formato: "PDF",
    tamaño: "-"
  }
];

export function ReportAdministration() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");

  const { toast } = useToast();

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.creadoPor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "todos" || report.tipo === filterType;
    
    return matchesSearch && matchesType;
  });

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Generado": return "default";
      case "En Proceso": return "secondary";
      case "Error": return "destructive";
      default: return "secondary";
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "Resumen Mensual": return "default";
      case "Análisis de Casos": return "secondary";
      case "Estadísticas": return "outline";
      case "Reporte Personalizado": return "destructive";
      default: return "secondary";
    }
  };

  const handleDownload = (report: Report) => {
    if (report.estado === "Generado") {
      toast({
        title: "Descargando reporte",
        description: `Iniciando descarga de ${report.nombre}`,
      });
      // Simular descarga
    } else {
      toast({
        title: "Error",
        description: "El reporte no está disponible para descarga",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      nombre: `Reporte Personalizado ${new Date().toLocaleDateString()}`,
      tipo: "Reporte Personalizado",
      fechaCreacion: new Date().toISOString().split('T')[0],
      creadoPor: "Admin Sistema",
      estado: "En Proceso",
      formato: "PDF",
      tamaño: "-"
    };

    setReports([newReport, ...reports]);
    
    // Simular generación de reporte
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, estado: "Generado" as const, tamaño: "3.2 MB" }
          : report
      ));
      toast({
        title: "Reporte generado",
        description: "El reporte ha sido generado exitosamente",
      });
    }, 3000);

    toast({
      title: "Generando reporte",
      description: "El reporte se está generando, esto puede tomar unos minutos",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold matrix-text font-mono">[ ADMINISTRACIÓN DE PLANILLAS ]</h2>
          <p className="text-muted-foreground font-mono">Gestión de reportes y planillas del sistema</p>
        </div>
        <Button onClick={handleGenerateReport} className="neon-border font-mono">
          <Plus className="w-4 h-4 mr-2" />
          GENERAR REPORTE
        </Button>
      </div>

      <Card className="neon-border theme-card">
        <CardHeader>
          <CardTitle className="flex items-center font-mono">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            CONTROL DE PLANILLAS Y REPORTES
          </CardTitle>
          <CardDescription>
            Gestión y seguimiento de reportes generados por el sistema
          </CardDescription>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              placeholder="Buscar reportes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="Resumen Mensual">Resumen Mensual</SelectItem>
                <SelectItem value="Análisis de Casos">Análisis de Casos</SelectItem>
                <SelectItem value="Estadísticas">Estadísticas</SelectItem>
                <SelectItem value="Reporte Personalizado">Reporte Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="font-mono">
              <Filter className="w-4 h-4 mr-2" />
              FILTROS AVANZADOS
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">NOMBRE</TableHead>
                <TableHead className="font-mono">TIPO</TableHead>
                <TableHead className="font-mono">FECHA</TableHead>
                <TableHead className="font-mono">CREADO POR</TableHead>
                <TableHead className="font-mono">ESTADO</TableHead>
                <TableHead className="font-mono">FORMATO</TableHead>
                <TableHead className="font-mono">TAMAÑO</TableHead>
                <TableHead className="font-mono">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-mono max-w-xs truncate">{report.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={getTipoBadgeVariant(report.tipo)} className="font-mono">
                      {report.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{report.fechaCreacion}</TableCell>
                  <TableCell className="font-mono">{report.creadoPor}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadgeVariant(report.estado)} className="font-mono">
                      {report.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{report.formato}</TableCell>
                  <TableCell className="font-mono">{report.tamaño}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-mono"
                        disabled={report.estado !== "Generado"}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(report)}
                        disabled={report.estado !== "Generado"}
                        className="font-mono"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Estadísticas de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">REPORTES TOTALES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold matrix-text">{reports.length}</div>
          </CardContent>
        </Card>
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">GENERADOS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {reports.filter(r => r.estado === "Generado").length}
            </div>
          </CardContent>
        </Card>
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">EN PROCESO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {reports.filter(r => r.estado === "En Proceso").length}
            </div>
          </CardContent>
        </Card>
        <Card className="neon-border theme-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">CON ERROR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {reports.filter(r => r.estado === "Error").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}