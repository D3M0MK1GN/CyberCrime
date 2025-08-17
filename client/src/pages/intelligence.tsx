import { useState } from "react";
import { Search, Globe, ExternalLink, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SearchResult {
  title: string;
  url: string;
  description: string;
  citations?: string[];
}

export function Intelligence() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("web");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un término de búsqueda",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiRequest("POST", "/api/intelligence/search", { query, mode: searchMode });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        
        if (data.results.length === 0) {
          toast({
            title: "Sin resultados",
            description: "No se encontraron resultados para tu búsqueda",
          });
        }
      } else {
        throw new Error("Error en la búsqueda");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al realizar la búsqueda. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Buscador */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Búsqueda de Inteligencia
          </CardTitle>
          <CardDescription>
            Ingresa términos relacionados con tu investigación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              data-testid="input-search-query"
              placeholder="Ej: técnicas de phishing, malware bancario, criptomonedas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Select value={searchMode} onValueChange={setSearchMode}>
              <SelectTrigger data-testid="select-search-mode" className="w-40">
                <SelectValue placeholder="Modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="go-search">Go-Search</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="ip-ser">IP-SER</SelectItem>
                <SelectItem value="social-red">Social-RED</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              data-testid="button-search"
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Resultados de búsqueda ({results.length})
            </h3>
            <Button 
              data-testid="button-export-results"
              variant="outline"
              size="sm"
              onClick={() => {
                // Lógica de exportación
                const exportData = {
                  query,
                  searchMode,
                  results,
                  timestamp: new Date().toISOString()
                };
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `busqueda_inteligencia_${new Date().toISOString().split('T')[0]}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Exportar Información
            </Button>
          </div>
          
          {results.map((result, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-blue-700 mb-2">
                      {result.title}
                    </h4>
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {result.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe className="w-4 h-4 mr-1" />
                      <span className="truncate">{result.url}</span>
                    </div>
                  </div>
                  <Button
                    data-testid={`button-open-result-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.url, '_blank')}
                    className="ml-4 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Abrir
                  </Button>
                </div>
                
                {result.citations && result.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Fuentes:</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.citations.slice(0, 3).map((citation, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded truncate max-w-xs"
                        >
                          {citation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {results.length === 0 && !isSearching && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Realiza una búsqueda
            </h3>
            <p className="text-gray-500">
              Usa el buscador de arriba para encontrar información relevante para tus investigaciones
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}