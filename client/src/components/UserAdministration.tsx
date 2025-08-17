import { useState } from "react";
import { Users, Plus, Edit, Trash2, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: "Administrador" | "Investigador" | "Analista" | "Auditor";
  estado: "Activo" | "Inactivo";
  fechaCreacion: string;
  ultimoAcceso: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    nombre: "Admin Sistema",
    email: "admin@cybercrime.com",
    rol: "Administrador",
    estado: "Activo",
    fechaCreacion: "2025-01-01",
    ultimoAcceso: "2025-01-16"
  },
  {
    id: "2", 
    nombre: "María González",
    email: "maria@cybercrime.com",
    rol: "Investigador",
    estado: "Activo",
    fechaCreacion: "2025-01-05",
    ultimoAcceso: "2025-01-15"
  },
  {
    id: "3",
    nombre: "Carlos Rodríguez", 
    email: "carlos@cybercrime.com",
    rol: "Analista",
    estado: "Inactivo",
    fechaCreacion: "2025-01-10",
    ultimoAcceso: "2025-01-12"
  }
];

export function UserAdministration() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "Investigador" as User["rol"],
    estado: "Activo" as User["estado"]
  });
  const { toast } = useToast();

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case "Administrador": return "destructive";
      case "Investigador": return "default";
      case "Analista": return "secondary";
      case "Auditor": return "outline";
      default: return "secondary";
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    return estado === "Activo" ? "default" : "secondary";
  };

  const handleSubmit = () => {
    if (!formData.nombre || !formData.email) {
      toast({
        title: "Error",
        description: "Nombre y email son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      // Editar usuario existente
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente",
      });
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimoAcceso: "-"
      };
      setUsers([...users, newUser]);
      toast({
        title: "Usuario creado",
        description: "El nuevo usuario ha sido creado exitosamente",
      });
    }

    // Resetear formulario
    setFormData({
      nombre: "",
      email: "",
      rol: "Investigador",
      estado: "Activo"
    });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado del sistema",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold matrix-text font-mono">[ ADMINISTRACIÓN DE USUARIOS ]</h2>
          <p className="text-muted-foreground font-mono">Gestión de usuarios del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="neon-border font-mono" onClick={() => {
              setEditingUser(null);
              setFormData({
                nombre: "",
                email: "",
                rol: "Investigador",
                estado: "Activo"
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              AGREGAR USUARIO
            </Button>
          </DialogTrigger>
          <DialogContent className="theme-modal">
            <DialogHeader>
              <DialogTitle className="font-mono">
                {editingUser ? "EDITAR USUARIO" : "NUEVO USUARIO"}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? "Modifica los datos del usuario" : "Agrega un nuevo usuario al sistema"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right font-mono">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="col-span-3"
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right font-mono">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                  placeholder="usuario@cybercrime.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rol" className="text-right font-mono">
                  Rol
                </Label>
                <Select value={formData.rol} onValueChange={(value: User["rol"]) => setFormData({...formData, rol: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Investigador">Investigador</SelectItem>
                    <SelectItem value="Analista">Analista</SelectItem>
                    <SelectItem value="Auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estado" className="text-right font-mono">
                  Estado
                </Label>
                <Select value={formData.estado} onValueChange={(value: User["estado"]) => setFormData({...formData, estado: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit} className="font-mono">
                {editingUser ? "ACTUALIZAR" : "CREAR"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="neon-border theme-card">
        <CardHeader>
          <CardTitle className="flex items-center font-mono">
            <Users className="w-5 h-5 mr-2 text-primary" />
            USUARIOS DEL SISTEMA
          </CardTitle>
          <CardDescription>
            Lista de usuarios registrados en el sistema
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono">NOMBRE</TableHead>
                <TableHead className="font-mono">EMAIL</TableHead>
                <TableHead className="font-mono">ROL</TableHead>
                <TableHead className="font-mono">ESTADO</TableHead>
                <TableHead className="font-mono">ÚLTIMO ACCESO</TableHead>
                <TableHead className="font-mono">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono">{user.nombre}</TableCell>
                  <TableCell className="font-mono">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.rol)} className="font-mono">
                      {user.rol}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadgeVariant(user.estado)} className="font-mono">
                      {user.estado === "Activo" ? (
                        <UserCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <Shield className="w-3 h-3 mr-1" />
                      )}
                      {user.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{user.ultimoAcceso}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="font-mono"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="font-mono"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}