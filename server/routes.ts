import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCyberCaseSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";
import crypto from "crypto";

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                 userAgent.includes('Firefox') ? 'Firefox' : 
                 userAgent.includes('Safari') ? 'Safari' : 
                 userAgent.includes('Edge') ? 'Edge' : 'Unknown';
  
  const os = userAgent.includes('Windows') ? 'Windows' : 
            userAgent.includes('Mac') ? 'macOS' : 
            userAgent.includes('Linux') ? 'Linux' : 
            userAgent.includes('Android') ? 'Android' : 
            userAgent.includes('iOS') ? 'iOS' : 'Unknown';
  
  return { browser, os };
}

// Hash password function (simple for demo - use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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

  // Initialize default users if not exist
  async function initializeDefaultUsers() {
    try {
      const defaultUsers = [
        {
          username: "admin",
          email: "admin@cybercrime.com",
          password: "admin123",
          firstName: "Administrador",
          lastName: "Sistema",
          role: "admin" as const,
          isActive: "true" as const
        },
        {
          username: "maria.gonzalez",
          email: "maria.gonzalez@cybercrime.com",
          password: "investigador123",
          firstName: "María",
          lastName: "González",
          role: "investigator" as const,
          isActive: "true" as const
        },
        {
          username: "carlos.rodriguez",
          email: "carlos.rodriguez@cybercrime.com", 
          password: "analista123",
          firstName: "Carlos",
          lastName: "Rodríguez",
          role: "user" as const,
          isActive: "true" as const
        },
        {
          username: "ana.martinez",
          email: "ana.martinez@cybercrime.com",
          password: "auditor123", 
          firstName: "Ana",
          lastName: "Martínez",
          role: "auditor" as const,
          isActive: "true" as const
        },
        {
          username: "jose.lopez",
          email: "jose.lopez@cybercrime.com",
          password: "investigador123",
          firstName: "José",
          lastName: "López", 
          role: "investigator" as const,
          isActive: "false" as const
        }
      ];

      for (const userData of defaultUsers) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (!existingUser) {
          await storage.createUser({
            ...userData,
            password: hashPassword(userData.password)
          });
          console.log(`Usuario ${userData.username} creado exitosamente`);
        }
      }
    } catch (error) {
      console.error("Error creating default users:", error);
    }
  }

  // Initialize default users
  await initializeDefaultUsers();

  // Login route with session tracking
  app.post('/api/login', async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || hashPassword(password) !== user.password || user.isActive !== "true") {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      // Create session record
      const sessionId = req.sessionID || crypto.randomUUID();
      const userAgent = req.headers['user-agent'] || '';
      const { browser, os } = parseUserAgent(userAgent);
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      await storage.createUserSession({
        userId: user.id,
        sessionId,
        ipAddress,
        userAgent,
        deviceInfo: `${browser} en ${os}`,
        browser,
        os,
        location: 'No disponible', // Could integrate with IP geolocation service
        isActive: "true"
      });

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
      
      res.json({ success: true });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Logout handler function
  const handleLogout = async (req: any, res: any) => {
    try {
      const sessionId = req.sessionID;
      if (sessionId) {
        await storage.updateSessionLogout(sessionId);
      }
      
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "No se pudo cerrar sesión" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  // Support both GET and POST for logout
  app.post('/api/logout', handleLogout);
  app.get('/api/logout', handleLogout);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.session.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User settings routes
  app.get("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId || "admin";
      const settings = await storage.getUserSettings(userId);
      
      // Return default settings if none exist
      if (!settings) {
        const defaultSettings = {
          primaryColor: "green",
          transparency: "85",
          neonEffects: "false",
          fontSize: "14",
          animations: "false"
        };
        res.json(defaultSettings);
      } else {
        res.json({
          primaryColor: settings.primaryColor,
          transparency: settings.transparency,
          neonEffects: settings.neonEffects,
          fontSize: settings.fontSize,
          animations: settings.animations
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.post("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId || "admin";
      const { primaryColor, transparency, neonEffects, fontSize, animations } = req.body;
      
      const settings = await storage.upsertUserSettings(userId, {
        primaryColor: primaryColor || "green",
        transparency: transparency?.toString() || "85",
        neonEffects: neonEffects?.toString() || "false",
        fontSize: fontSize?.toString() || "14",
        animations: animations?.toString() || "false"
      });
      
      res.json({
        primaryColor: settings.primaryColor,
        transparency: settings.transparency,
        neonEffects: settings.neonEffects,
        fontSize: settings.fontSize,
        animations: settings.animations
      });
    } catch (error) {
      console.error("Error saving user settings:", error);
      res.status(500).json({ message: "Failed to save user settings" });
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
  
  // User management endpoints
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  });

  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      // Hash password before storing
      const hashedPassword = hashPassword(userData.password);
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      // Remove password from response
      const { password, ...safeUser } = newUser;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Error de validación", errors: error.errors });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error al crear usuario' });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      // Hash password if provided
      if (userData.password) {
        userData.password = hashPassword(userData.password);
      }
      const updatedUser = await storage.updateUser(id, userData);
      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Error de validación", errors: error.errors });
      }
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Error al eliminar usuario' });
    }
  });

  // User sessions endpoints
  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getAllActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ message: 'Error al obtener sesiones' });
    }
  });

  app.get('/api/users/:id/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const sessions = await storage.getUserSessions(id);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      res.status(500).json({ message: 'Error al obtener sesiones del usuario' });
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
