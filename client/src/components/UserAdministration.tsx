import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Shield, UserCheck, Monitor, MapPin, Clock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user" | "investigator" | "auditor";
  isActive: "true" | "false";
  createdAt: string;
  lastLoginAt?: string;
}

interface UserSession {
  id: string;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  browser: string;
  os: string;
  location: string;
  loginAt: string;
  logoutAt?: string;
  isActive: "true" | "false";
  user?: User;
}

export function UserAdministration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user" as User["role"],
    isActive: "true" as User["isActive"]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });

  // Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/sessions"],
    queryFn: async () => {
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error("Failed to fetch sessions");
      return response.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear usuario",
        variant: "destructive",
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<typeof formData> }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar usuario",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado del sistema",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar usuario",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users.filter((user: User) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "investigator": return "default";
      case "user": return "secondary";
      case "auditor": return "outline";
      default: return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "investigator": return "Investigador";
      case "user": return "Usuario";
      case "auditor": return "Auditor";
      default: return "Usuario";
    }
  };

  const getEstadoBadgeVariant = (isActive: string) => {
    return isActive === "true" ? "default" : "secondary";
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "user",
      isActive: "true"
    });
    setEditingUser(null);
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.username) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!editingUser && !formData.password) {
      toast({
        title: "Error",
        description: "La contraseña es obligatoria para usuarios nuevos",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      const updateData: Partial<typeof formData> = { ...formData };
      if (!updateData.password) {
        const { password, ...dataWithoutPassword } = updateData;
        updateUserMutation.mutate({ id: editingUser.id, userData: dataWithoutPassword });
      } else {
        updateUserMutation.mutate({ id: editingUser.id, userData: updateData });
      }
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Never prefill password
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold font-mono tracking-tight">ADMINISTRACIÓN DE USUARIOS</h1>
        <p className="text-muted-foreground">Gestiona usuarios del sistema y monitorea sesiones activas</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="font-mono">USUARIOS</TabsTrigger>
          <TabsTrigger value="sessions" className="font-mono">SESIONES ACTIVAS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono flex items-center gap-2">
                <Users className="w-5 h-5" />
                USUARIOS DEL SISTEMA
              </CardTitle>
              <CardDescription>
                Administra cuentas de usuario y permisos de acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-72">
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                      }}
                      className="font-mono"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      NUEVO USUARIO
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
                        <Label htmlFor="username" className="text-right font-mono">
                          Usuario
                        </Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="col-span-3"
                          placeholder="nombre_usuario"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="firstName" className="text-right font-mono">
                          Nombre
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="col-span-3"
                          placeholder="Nombre"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastName" className="text-right font-mono">
                          Apellido
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="col-span-3"
                          placeholder="Apellido"
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
                        <Label htmlFor="password" className="text-right font-mono">
                          Contraseña
                        </Label>
                        <div className="col-span-3 relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder={editingUser ? "Dejar vacío para no cambiar" : "Contraseña"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right font-mono">
                          Rol
                        </Label>
                        <Select value={formData.role} onValueChange={(value: User["role"]) => setFormData({...formData, role: value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="investigator">Investigador</SelectItem>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="auditor">Auditor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isActive" className="text-right font-mono">
                          Estado
                        </Label>
                        <Select value={formData.isActive} onValueChange={(value: User["isActive"]) => setFormData({...formData, isActive: value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Activo</SelectItem>
                            <SelectItem value="false">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={createUserMutation.isPending || updateUserMutation.isPending}
                        className="font-mono"
                      >
                        {editingUser ? "ACTUALIZAR" : "CREAR"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="font-mono">Cargando usuarios...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">USUARIO</TableHead>
                      <TableHead className="font-mono">NOMBRE</TableHead>
                      <TableHead className="font-mono">EMAIL</TableHead>
                      <TableHead className="font-mono">ROL</TableHead>
                      <TableHead className="font-mono">ESTADO</TableHead>
                      <TableHead className="font-mono">ÚLTIMO ACCESO</TableHead>
                      <TableHead className="font-mono">ACCIONES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono">{user.username}</TableCell>
                        <TableCell className="font-mono">{user.firstName} {user.lastName}</TableCell>
                        <TableCell className="font-mono">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="font-mono">
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(user.isActive)} className="font-mono">
                            {user.isActive === "true" ? (
                              <UserCheck className="w-3 h-3 mr-1" />
                            ) : (
                              <Shield className="w-3 h-3 mr-1" />
                            )}
                            {user.isActive === "true" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Nunca"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="font-mono"
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              className="font-mono"
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                SESIONES ACTIVAS
              </CardTitle>
              <CardDescription>
                Monitorea las sesiones activas con información de dispositivos e IP
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="text-center py-8">
                  <div className="font-mono">Cargando sesiones...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">USUARIO</TableHead>
                      <TableHead className="font-mono">DIRECCIÓN IP</TableHead>
                      <TableHead className="font-mono">DISPOSITIVO</TableHead>
                      <TableHead className="font-mono">NAVEGADOR</TableHead>
                      <TableHead className="font-mono">SISTEMA</TableHead>
                      <TableHead className="font-mono">UBICACIÓN</TableHead>
                      <TableHead className="font-mono">INICIO SESIÓN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: UserSession) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono">
                          {session.user ? `${session.user.firstName} ${session.user.lastName}` : 'Usuario desconocido'}
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.ipAddress}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{session.deviceInfo}</TableCell>
                        <TableCell className="font-mono">{session.browser}</TableCell>
                        <TableCell className="font-mono">{session.os}</TableCell>
                        <TableCell className="font-mono">{session.location}</TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(session.loginAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 font-mono">
                          No hay sesiones activas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}