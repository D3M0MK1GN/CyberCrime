import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, X } from "lucide-react";
import { insertCyberCaseSchema, type CyberCase } from "@shared/schema";
import { z } from "zod";

const formSchema = insertCyberCaseSchema.extend({
  caseDate: z.string().min(1, "La fecha es requerida"),
  stolenAmount: z.string().min(1, "El monto es requerido"),
});

type FormData = z.infer<typeof formSchema>;

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: CyberCase | null;
  isLoading?: boolean;
}

const crimeTypes = [
  "Hacking",
  "Phishing", 
  "Malware",
  "Ransomware",
  "Fraude cibernético",
  "Robo de identidad",
  "Ciberacoso",
  "Suplantación de identidad",
];

const investigationStatuses = [
  "Pendiente",
  "En proceso",
  "Completado",
  "Sin respuesta",
  "Rechazado",
];

export function CaseModal({ isOpen, onClose, onSubmit, initialData, isLoading = false }: CaseModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseDate: initialData?.caseDate || "",
      expedientNumber: initialData?.expedientNumber || "",
      crimeType: initialData?.crimeType || "",
      senderAccountData: initialData?.senderAccountData || "",
      victim: initialData?.victim || "",
      receiverAccountData: initialData?.receiverAccountData || "",
      investigationStatus: initialData?.investigationStatus || "Pendiente",
      stolenAmount: initialData?.stolenAmount?.toString() || "",
      observations: initialData?.observations || "",
      receiverAccountResearch: initialData?.receiverAccountResearch || "",
    },
  });

  const handleSubmit = (data: FormData) => {
    const payload = {
      ...data,
      stolenAmount: parseFloat(data.stolenAmount),
    };
    onSubmit(payload);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto theme-modal">
        <DialogHeader>
          <DialogTitle className="matrix-text font-mono text-xl">
            {initialData ? "[ EDITAR CASO ]" : "[ NUEVO CASO ]"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="caseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-sm">FECHA DEL CASO</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expedientNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-sm">NÚMERO DE EXPEDIENTE</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="EXP-2025-001" className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crimeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-sm">TIPO DE DELITO</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Selecciona el tipo de delito" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {crimeTypes.map((type) => (
                          <SelectItem key={type} value={type} className="font-mono">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="victim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-sm">VÍCTIMA</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre de la víctima" className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stolenAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-sm">MONTO ESTAFADO</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investigationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-sm">ESTADO DE INVESTIGACIÓN</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investigationStatuses.map((status) => (
                          <SelectItem key={status} value={status} className="font-mono">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="senderAccountData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-sm">DATOS DE LA CUENTA EMISORA</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Información de la cuenta desde donde se envió el dinero..."
                      className="font-mono min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiverAccountData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-sm">DATOS DE LA CUENTA RECEPTORA</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Información de la cuenta donde se recibió el dinero..."
                      className="font-mono min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-sm">OBSERVACIONES</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Observaciones adicionales del caso..."
                      className="font-mono min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4 border-t border-border/20">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="font-mono"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                CANCELAR
              </Button>
              <Button
                type="submit"
                className="font-mono neon-border"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "GUARDANDO..." : "GUARDAR"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}