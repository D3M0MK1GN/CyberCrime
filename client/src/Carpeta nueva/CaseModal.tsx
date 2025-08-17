import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
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
  editingCase?: CyberCase | null;
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

export function CaseModal({ isOpen, onClose, editingCase }: CaseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseDate: editingCase?.caseDate || "",
      expedientNumber: editingCase?.expedientNumber || "",
      crimeType: editingCase?.crimeType || "",
      senderAccountData: editingCase?.senderAccountData || "",
      victim: editingCase?.victim || "",
      receiverAccountData: editingCase?.receiverAccountData || "",
      investigationStatus: editingCase?.investigationStatus || "Pendiente",
      stolenAmount: editingCase?.stolenAmount || "",
      observations: editingCase?.observations || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        stolenAmount: parseFloat(data.stolenAmount).toString(),
      };
      await apiRequest("POST", "/api/cyber-cases", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cyber-cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Éxito",
        description: "Caso creado correctamente",
      });
      handleClose();
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
        description: "No se pudo crear el caso",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        stolenAmount: parseFloat(data.stolenAmount).toString(),
      };
      await apiRequest("PUT", `/api/cyber-cases/${editingCase?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cyber-cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Éxito",
        description: "Caso actualizado correctamente",
      });
      handleClose();
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
        description: "No se pudo actualizar el caso",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    if (editingCase) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCase ? "Editar Caso" : "Agregar Nuevo Caso"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="caseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Fecha <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-case-date"
                        type="date"
                        {...field}
                      />
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
                    <FormLabel>
                      N° de Expediente <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-expedient-number"
                        placeholder="EXP-2024-XXXX"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="crimeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo de Delito <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-crime-type-modal">
                        <SelectValue placeholder="Seleccionar tipo de delito" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crimeTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="senderAccountData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Datos de la Cuenta Emisora <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-sender-account"
                        placeholder="Banco, número de cuenta, titular, etc."
                        rows={3}
                        className="resize-vertical"
                        {...field}
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
                    <FormLabel>
                      Datos de la Cuenta Receptora <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-receiver-account"
                        placeholder="Banco, número de cuenta, titular, etc."
                        rows={3}
                        className="resize-vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiverAccountResearch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pesquisa a Cuenta Receptora
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="textarea-receiver-research"
                        placeholder="Resultado de la investigación de la cuenta receptora"
                        rows={3}
                        className="resize-vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="victim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Víctima <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-victim"
                      placeholder="Nombre completo de la víctima"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="investigationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesquisa a Cuenta Receptora</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-investigation-status">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investigationStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
                name="stolenAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Monto Sustraído <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500">$</span>
                        <Input
                          data-testid="input-stolen-amount"
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="textarea-observations"
                      placeholder="Detalles adicionales del caso, evidencias, notas, etc."
                      rows={4}
                      className="resize-vertical"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                data-testid="button-cancel"
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                data-testid="button-save"
                type="submit"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading 
                  ? "Guardando..." 
                  : editingCase 
                    ? "Actualizar Caso" 
                    : "Guardar Caso"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
