import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, RotateCcw, Palette, Monitor, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme, type ThemeSettings } from "@/hooks/useTheme";

const colorOptions = [
  { value: "green", label: "VERDE MATRIX", color: "hsl(120, 100%, 45%)" },
  { value: "blue", label: "AZUL CIBERNÉTICO", color: "hsl(200, 100%, 45%)" },
  { value: "purple", label: "PÚRPURA TECH", color: "hsl(280, 100%, 45%)" },
  { value: "red", label: "ROJO ALERT", color: "hsl(0, 100%, 45%)" },
  { value: "orange", label: "NARANJA HACK", color: "hsl(30, 100%, 45%)" },
];

const secondaryColorOptions = [
  { value: "gray", label: "GRIS OSCURO", color: "hsl(0, 0%, 15%)" },
  { value: "slate", label: "PIZARRA", color: "hsl(210, 40%, 20%)" },
  { value: "zinc", label: "ZINC", color: "hsl(240, 4%, 20%)" },
  { value: "stone", label: "PIEDRA", color: "hsl(25, 5%, 20%)" },
  { value: "neutral", label: "NEUTRO", color: "hsl(0, 0%, 20%)" },
];

export function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use the centralized theme hook
  const { settings, isLoading, applyThemeChanges, setSettings } = useTheme();

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsToSave: ThemeSettings) => {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsToSave),
      });
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "CONFIGURACIÓN GUARDADA",
        description: "Los cambios se han aplicado exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "ERROR AL GUARDAR",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    applyThemeChanges(settings);
    saveSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    const defaultSettings: ThemeSettings = {
      primaryColor: "green",
      secondaryColor: "gray",
      transparency: 85,
      neonEffects: false,
      fontSize: 14,
      animations: false,
    };
    setSettings(defaultSettings);
    applyThemeChanges(defaultSettings);
    saveSettingsMutation.mutate(defaultSettings);
    toast({
      title: "CONFIGURACIÓN RESTABLECIDA",
      description: "Se han restaurado los valores por defecto",
    });
  };

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applyThemeChanges(newSettings);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold matrix-text mb-2">[ CONFIGURACIÓN DEL SISTEMA ]</h1>
        <p className="text-muted-foreground font-mono">Personaliza la apariencia y comportamiento del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <Card className="neon-border theme-card">
          <CardHeader>
            <CardTitle className="matrix-text font-mono flex items-center gap-2">
              <Palette className="w-5 h-5" />
              [ CONFIGURACIÓN VISUAL ]
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium font-mono">COLOR PRIMARIO</Label>
              <Select value={settings.primaryColor} onValueChange={(value) => updateSetting("primaryColor", value)}>
                <SelectTrigger className="neon-border font-mono">
                  <SelectValue>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded border border-border" 
                        style={{ backgroundColor: colorOptions.find(opt => opt.value === settings.primaryColor)?.color || "#00ff00" }}
                      />
                      {colorOptions.find(opt => opt.value === settings.primaryColor)?.label || "VERDE MATRIX"}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="theme-modal">
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-mono">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded border border-border" 
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Secondary Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium font-mono">COLOR SECUNDARIO</Label>
              <Select value={settings.secondaryColor} onValueChange={(value) => updateSetting("secondaryColor", value)}>
                <SelectTrigger className="neon-border font-mono">
                  <SelectValue>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded border border-border" 
                        style={{ backgroundColor: secondaryColorOptions.find(opt => opt.value === settings.secondaryColor)?.color || "hsl(0, 0%, 15%)" }}
                      />
                      {secondaryColorOptions.find(opt => opt.value === settings.secondaryColor)?.label || "GRIS OSCURO"}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="theme-modal">
                  {secondaryColorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="font-mono">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded border border-border" 
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Transparency */}
            <div className="space-y-3">
              <Label className="text-sm font-medium font-mono">
                OPACIDAD DE COMPONENTES: {settings.transparency}%
              </Label>
              <Slider
                value={[settings.transparency]}
                onValueChange={(value) => updateSetting("transparency", value[0])}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground font-mono">
                Controla la transparencia de los paneles y modales
              </p>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="space-y-3">
              <Label className="text-sm font-medium font-mono">
                TAMAÑO DE FUENTE: {settings.fontSize}px
              </Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={(value) => updateSetting("fontSize", value[0])}
                max={18}
                min={12}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Effects Settings */}
        <Card className="neon-border theme-card">
          <CardHeader>
            <CardTitle className="matrix-text font-mono flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              [ EFECTOS Y COMPORTAMIENTO ]
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Neon Effects */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium font-mono">EFECTOS NEÓN</Label>
                <p className="text-xs text-muted-foreground font-mono">
                  Bordes y resplandores cibernéticos
                </p>
              </div>
              <Switch
                checked={settings.neonEffects}
                onCheckedChange={(checked) => updateSetting("neonEffects", checked)}
              />
            </div>

            <Separator />

            {/* Animations */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium font-mono">ANIMACIONES</Label>
                <p className="text-xs text-muted-foreground font-mono">
                  Transiciones y efectos animados
                </p>
              </div>
              <Switch
                checked={settings.animations}
                onCheckedChange={(checked) => updateSetting("animations", checked)}
              />
            </div>


          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="neon-border theme-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="matrix-text font-mono flex items-center gap-2">
              <Shield className="w-5 h-5" />
              [ INFORMACIÓN DEL SISTEMA ]
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
              <div>
                <p className="text-muted-foreground">VERSIÓN:</p>
                <p className="text-foreground">CYBER-CRIME v2.1.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">ÚLTIMA ACTUALIZACIÓN:</p>
                <p className="text-foreground">16 AGO 2025</p>
              </div>
              <div>
                <p className="text-muted-foreground">ESTADO:</p>
                <p className="text-primary">OPERATIVO</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button onClick={handleSave} className="neon-border font-mono">
          <Save className="w-4 h-4 mr-2" />
          GUARDAR CONFIGURACIÓN
        </Button>
        <Button onClick={handleReset} variant="outline" className="neon-border font-mono">
          <RotateCcw className="w-4 h-4 mr-2" />
          RESTABLECER
        </Button>
      </div>
    </div>
  );
}