import { cn } from "@/lib/utils";
import { BarChart3, Database, Settings, Globe, MessageCircle, LogOut, Shield } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: BarChart3 },
  { id: "intelligence", name: "Inteligencia", icon: Globe },
  { id: "data-management", name: "Gestión de Casos", icon: Database },
  { id: "chatbot", name: "Asistente Virtual", icon: MessageCircle },
  { id: "settings", name: "Configuración", icon: Settings },
];

export function Sidebar({ isOpen, onClose, currentSection, onSectionChange }: SidebarProps) {
  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    onClose(); // Close sidebar on mobile after selection
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-30",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-800">Sistema CyberCrime</h2>
            <p className="text-xs text-gray-600">Delitos Informáticos</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  data-testid={`nav-${item.id}`}
                  onClick={() => handleSectionClick(item.id)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors group",
                    isActive
                      ? "bg-blue-50 text-primary"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary" : "text-gray-500 group-hover:text-primary"
                  )} />
                  <span className="ml-3">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          data-testid="button-logout"
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg hover:bg-red-50 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
          <span className="ml-3 text-gray-700 group-hover:text-red-700">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
