import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { DataManagementFast as DataManagement } from "@/components/DataManagementFast";
import { Settings } from "@/components/Settings";
import { Chatbot } from "@/pages/chatbot";
import { Intelligence } from "@/pages/intelligence";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentSection, setCurrentSection] = useState("dashboard");
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return null; // Will redirect to login
  }

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "data-management":
        return <DataManagement />;
      case "chatbot":
        return <Chatbot />;
      case "intelligence":
        return <Intelligence />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderSection()}
    </Layout>
  );
}
