import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCyberCaseSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Simple auth middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.set("trust proxy", 1);
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || "cyber-crime-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));

  // Simple login route
  app.post('/api/login', async (req: any, res) => {
    const { username, password } = req.body;
    
    // Simple hardcoded credentials (in production use proper auth)
    if (username === "admin" && password === "admin123") {
      req.session.userId = "admin";
      req.session.user = {
        id: "admin",
        username: "admin",
        email: "admin@cybercrime.com",
        firstName: "Administrador",
        lastName: "Sistema",
      };
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post('/api/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ success: true });
    });
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.session.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId || "admin";
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Cyber cases routes
  app.get("/api/cyber-cases", isAuthenticated, async (req: any, res) => {
    try {
      const { page, limit, search, crimeType, dateFrom, dateTo } = req.query;
      const result = await storage.getCyberCases({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        search: search || "",
        crimeType: crimeType || "",
        dateFrom: dateFrom || "",
        dateTo: dateTo || "",
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching cyber cases:", error);
      res.status(500).json({ message: "Failed to fetch cyber cases" });
    }
  });

  app.get("/api/cyber-cases/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const cyberCase = await storage.getCyberCase(id);
      if (!cyberCase) {
        return res.status(404).json({ message: "Cyber case not found" });
      }
      res.json(cyberCase);
    } catch (error) {
      console.error("Error fetching cyber case:", error);
      res.status(500).json({ message: "Failed to fetch cyber case" });
    }
  });

  app.post("/api/cyber-cases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId || "admin";
      const validatedData = insertCyberCaseSchema.parse(req.body);
      const cyberCase = await storage.createCyberCase(validatedData, userId);
      res.status(201).json(cyberCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating cyber case:", error);
      res.status(500).json({ message: "Failed to create cyber case" });
    }
  });

  app.put("/api/cyber-cases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session?.userId || "admin";
      const validatedData = insertCyberCaseSchema.partial().parse(req.body);
      const cyberCase = await storage.updateCyberCase(id, validatedData, userId);
      res.json(cyberCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating cyber case:", error);
      res.status(500).json({ message: "Failed to update cyber case" });
    }
  });

  app.delete("/api/cyber-cases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session?.userId || "admin";
      await storage.deleteCyberCase(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting cyber case:", error);
      res.status(500).json({ message: "Failed to delete cyber case" });
    }
  });

  // Intelligence search endpoint
  app.post('/api/intelligence/search', isAuthenticated, async (req: any, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Query is required' });
      }
      
      // For now, return mock search results until we implement a real search service
      const mockResults = [
        {
          title: `Información sobre: ${query}`,
          url: `https://example.com/search?q=${encodeURIComponent(query)}`,
          description: `Resultados relacionados con ${query}. Esta es una implementación temporal que muestra cómo funcionará la búsqueda inteligente.`,
          citations: ['https://cybersecurity.org', 'https://cert.gov']
        },
        {
          title: `Guías de investigación: ${query}`,
          url: `https://investigacion-cyber.com/${query.toLowerCase()}`,
          description: `Metodologías y técnicas para investigar casos relacionados con ${query}. Incluye mejores prácticas y herramientas recomendadas.`,
          citations: ['https://forensics.org']
        }
      ];
      
      res.json({ results: mockResults });
    } catch (error) {
      console.error('Intelligence search error:', error);
      res.status(500).json({ message: 'Error en la búsqueda' });
    }
  });
  
  // Chatbot endpoint
  app.post('/api/chatbot/message', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message is required' });
      }
      
      // Simple rule-based chatbot responses for cyber crime topics
      let response = '';
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('phishing') || lowerMessage.includes('suplantación')) {
        response = 'El phishing es una técnica de ingeniería social donde los atacantes se hacen pasar por entidades confiables para obtener información sensible. Para investigar casos de phishing:\n\n1. Analiza los headers del correo electrónico\n2. Verifica el dominio remitente\n3. Examina los enlaces y archivos adjuntos\n4. Documenta las cuentas bancarias involucradas\n\n¿Necesitas ayuda con algún aspecto específico del análisis de phishing?';
      } else if (lowerMessage.includes('malware') || lowerMessage.includes('virus')) {
        response = 'Para casos de malware en delitos informáticos:\n\n1. Aísla el sistema infectado\n2. Captura evidencia forense antes de la limpieza\n3. Analiza los hashes de archivos sospechosos\n4. Documenta la cadena de infección\n5. Identifica sistemas comprometidos\n\n¿Qué tipo de malware estás investigando? (ransomware, trojan bancario, spyware, etc.)';
      } else if (lowerMessage.includes('criptomoneda') || lowerMessage.includes('bitcoin') || lowerMessage.includes('blockchain')) {
        response = 'Para investigaciones con criptomonedas:\n\n1. Rastrea las direcciones de wallet involucradas\n2. Usa herramientas de análisis blockchain (Chainalysis, Crystal)\n3. Identifica exchanges utilizados\n4. Documenta transacciones sospechosas\n5. Colabora con exchanges para obtener información KYC\n\n¿Tienes direcciones de wallet específicas para analizar?';
      } else if (lowerMessage.includes('fraude') || lowerMessage.includes('estafa')) {
        response = 'Para casos de fraude informático:\n\n1. Documenta el modus operandi del atacante\n2. Recopila evidencia de comunicaciones\n3. Analiza flujos financieros\n4. Identifica víctimas adicionales\n5. Coordina con entidades financieras\n\n¿Qué tipo de fraude estás investigando? (SIM swapping, business email compromise, romance scam, etc.)';
      } else if (lowerMessage.includes('forensic') || lowerMessage.includes('evidencia')) {
        response = 'Para análisis forense digital:\n\n1. Mantén la cadena de custodia\n2. Crea imágenes bit a bit de dispositivos\n3. Usa herramientas certificadas (EnCase, FTK, Autopsy)\n4. Documenta todos los procedimientos\n5. Preserva metadatos originales\n\n¿Qué tipo de dispositivo necesitas analizar?';
      } else {
        response = `Hola, soy tu asistente especializado en delitos informáticos. He recibido tu consulta sobre "${message}".\n\nPuedo ayudarte con:\n• Análisis de phishing y fraudes\n• Investigación de malware\n• Rastreo de criptomonedas\n• Análisis forense digital\n• Técnicas de investigación\n• Normativas legales\n\n¿Podrías ser más específico sobre qué aspecto necesitas que te ayude?`;
      }
      
      res.json({ response });
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ message: 'Error en el chatbot' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
