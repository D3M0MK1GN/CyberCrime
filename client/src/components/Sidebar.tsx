import { cn } from "@/lib/utils";
import { BarChart3, Database, Settings, LogOut, Shield, MessageCircle, Search } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: "dashboard", name: "DASHBOARD", icon: BarChart3 },
  { id: "data-management", name: "GESTIÓN DE CASOS", icon: Database },
  { id: "intelligence", name: "INTELIGENCIA", icon: Search },
  { id: "chatbot", name: "ASISTENTE IA", icon: MessageCircle },
  { id: "settings", name: "CONFIGURACIÓN", icon: Settings },
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
        "fixed left-0 top-0 h-full w-64 theme-card shadow-lg transform transition-transform duration-300 z-30 neon-border",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="p-6 border-b border-primary/30">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center neon-border">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold matrix-text font-mono">[ CYBER-CRIME ]</h2>
            <p className="text-xs text-muted-foreground font-mono">SISTEMA FORENSE</p>
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
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors group font-mono",
                    isActive
                      ? "bg-primary/20 text-primary-custom neon-border"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary-custom" : "text-muted-foreground group-hover:text-primary-custom"
                  )} />
                  <span className="ml-3">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <button
          data-testid="button-logout"
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg hover:bg-destructive/20 transition-colors group font-mono"
        >
          <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
          <span className="ml-3 text-muted-foreground group-hover:text-destructive">DESCONECTAR</span>
        </button>
      </div>
    </div>
  );
}
