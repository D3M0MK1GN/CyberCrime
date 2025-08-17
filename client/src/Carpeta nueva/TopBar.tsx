import { Bell, Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  onMenuClick: () => void;
  currentSection: string;
}

const sectionTitles = {
  dashboard: "Dashboard",
  "data-management": "Gestión de Datos",
  settings: "Configuración",
  users: "Usuarios",
};

export function TopBar({ onMenuClick, currentSection }: TopBarProps) {
  const { user } = useAuth() as { user: any };

  return (
    <div className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white shadow-sm border-b border-gray-200 z-20">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center">
          <button
            data-testid="button-menu"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">
            {sectionTitles[currentSection as keyof typeof sectionTitles] || "Sistema"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            data-testid="button-notifications"
            className="p-2 rounded-full hover:bg-gray-100 relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
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
              <p data-testid="text-username" className="text-sm font-medium text-gray-800">
                {user?.firstName || user?.lastName 
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : user?.email || "Usuario"
                }
              </p>
              <p className="text-xs text-gray-600">Administrador</p>
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' });
              window.location.reload();
            }}
            data-testid="button-logout"
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
