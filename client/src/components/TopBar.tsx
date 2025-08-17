import { Bell, Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  onMenuClick: () => void;
  currentSection: string;
}

const sectionTitles = {
  dashboard: "[ DASHBOARD DE CONTROL ]",
  "data-management": "[ BASE DE DATOS ]",
  settings: "[ CONFIGURACIÓN ]",
  users: "[ USUARIOS ]",
};

export function TopBar({ onMenuClick, currentSection }: TopBarProps) {
  const { user } = useAuth() as { user: any };

  return (
    <div className="fixed top-0 left-0 lg:left-64 right-0 h-16 theme-card backdrop-blur-md shadow-sm border-b border-primary/30 z-20 neon-border">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          <button
            data-testid="button-menu"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-primary/10 neon-border transition-colors"
          >
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="ml-4 text-xl font-semibold matrix-text font-mono">
            {sectionTitles[currentSection as keyof typeof sectionTitles] || "[ SISTEMA ]"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            data-testid="button-notifications"
            className="p-2 rounded-full hover:bg-primary/10 relative neon-border transition-colors"
          >
            <Bell className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
          </button>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center neon-border">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="ml-3 hidden sm:block">
              <p data-testid="text-username" className="text-sm font-medium text-foreground font-mono">
                {user?.firstName || user?.lastName 
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : user?.email || "USUARIO"
                }
              </p>
              <p className="text-xs text-muted-foreground font-mono">ADMINISTRADOR</p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/logout', { 
                  method: 'POST',
                  credentials: 'include'
                });
                if (response.ok) {
                  window.location.href = '/api/login';
                } else {
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error al cerrar sesión:', error);
                window.location.href = '/api/login';
              }
            }}
            data-testid="button-logout"
            className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive neon-button"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
