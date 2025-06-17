// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  franchises;
  assets;
  audits;
  auditEntries;
  currentUserId;
  currentFranchiseId;
  currentAssetId;
  currentAuditId;
  currentAuditEntryId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.franchises = /* @__PURE__ */ new Map();
    this.assets = /* @__PURE__ */ new Map();
    this.audits = /* @__PURE__ */ new Map();
    this.auditEntries = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentFranchiseId = 1;
    this.currentAssetId = 1;
    this.currentAuditId = 1;
    this.currentAuditEntryId = 1;
    this.initializeData();
  }
  initializeData() {
    const franchise = {
      id: this.currentFranchiseId++,
      name: "Franchise ABC - Mumbai",
      sapCode: "FP001",
      city: "Mumbai",
      state: "Maharashtra"
    };
    this.franchises.set(franchise.id, franchise);
    const kae = {
      id: this.currentUserId++,
      username: "kae_mumbai",
      password: "password123"
    };
    this.users.set(kae.id, kae);
    const sampleAssets = [
      {
        serialNumber: "BAT-2024-001",
        assetMake: "Exide",
        assetModel: "EXD-500",
        iotNumber: "IOT123456",
        assetCategory: "battery",
        franchiseId: franchise.id,
        status: "pending",
        qrCodeAvailable: true
      },
      {
        serialNumber: "CHG-2024-002",
        assetMake: "Delta",
        assetModel: "DLT-200",
        iotNumber: "IOT789012",
        assetCategory: "charger",
        franchiseId: franchise.id,
        status: "verified",
        assetStatus: "deployed-driver",
        qrCodeAvailable: true
      },
      {
        serialNumber: "SOC-2024-003",
        assetMake: "TechSoc",
        assetModel: "TS-100",
        iotNumber: "IOT345678",
        assetCategory: "soc-meter",
        franchiseId: franchise.id,
        status: "mismatch",
        qrCodeAvailable: false
      }
    ];
    sampleAssets.forEach((asset) => {
      const newAsset = {
        ...asset,
        id: this.currentAssetId++,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.assets.set(newAsset.id, newAsset);
    });
    const audit = {
      id: this.currentAuditId++,
      franchiseId: franchise.id,
      kaeId: kae.id,
      status: "in-progress",
      totalAssets: 25,
      verifiedAssets: 8,
      pendingAssets: 13,
      mismatchAssets: 1,
      socMeterCount: 0,
      harnessCount: 0,
      startedAt: /* @__PURE__ */ new Date(),
      completedAt: null
    };
    this.audits.set(audit.id, audit);
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const user = { ...insertUser, id: this.currentUserId++ };
    this.users.set(user.id, user);
    return user;
  }
  // Franchise methods
  async getFranchise(id) {
    return this.franchises.get(id);
  }
  async getFranchiseBySapCode(sapCode) {
    return Array.from(this.franchises.values()).find((f) => f.sapCode === sapCode);
  }
  async getAllFranchises() {
    return Array.from(this.franchises.values());
  }
  async createFranchise(insertFranchise) {
    const franchise = { ...insertFranchise, id: this.currentFranchiseId++ };
    this.franchises.set(franchise.id, franchise);
    return franchise;
  }
  // Asset methods
  async getAsset(id) {
    return this.assets.get(id);
  }
  async getAssetBySerialNumber(serialNumber) {
    return Array.from(this.assets.values()).find((a) => a.serialNumber === serialNumber);
  }
  async getAssetsByFranchise(franchiseId) {
    return Array.from(this.assets.values()).filter((a) => a.franchiseId === franchiseId);
  }
  async createAsset(insertAsset) {
    const asset = {
      ...insertAsset,
      id: this.currentAssetId++,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.assets.set(asset.id, asset);
    return asset;
  }
  async updateAsset(id, updates) {
    const asset = this.assets.get(id);
    if (!asset) return void 0;
    const updatedAsset = { ...asset, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }
  async deleteAsset(id) {
    return this.assets.delete(id);
  }
  // Audit methods
  async getAudit(id) {
    return this.audits.get(id);
  }
  async getAuditByFranchise(franchiseId) {
    return Array.from(this.audits.values()).find((a) => a.franchiseId === franchiseId);
  }
  async createAudit(insertAudit) {
    const audit = {
      ...insertAudit,
      id: this.currentAuditId++,
      startedAt: /* @__PURE__ */ new Date(),
      completedAt: null
    };
    this.audits.set(audit.id, audit);
    return audit;
  }
  async updateAudit(id, updates) {
    const audit = this.audits.get(id);
    if (!audit) return void 0;
    const updatedAudit = { ...audit, ...updates };
    this.audits.set(id, updatedAudit);
    return updatedAudit;
  }
  // Audit entry methods
  async getAuditEntries(auditId) {
    return Array.from(this.auditEntries.values()).filter((e) => e.auditId === auditId);
  }
  async createAuditEntry(insertEntry) {
    const entry = {
      ...insertEntry,
      id: this.currentAuditEntryId++,
      auditedAt: /* @__PURE__ */ new Date()
    };
    this.auditEntries.set(entry.id, entry);
    return entry;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var franchises = pgTable("franchises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sapCode: text("sap_code").notNull().unique(),
  city: text("city").notNull(),
  state: text("state").notNull()
});
var assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull().unique(),
  assetMake: text("asset_make").notNull(),
  assetModel: text("asset_model").notNull(),
  iotNumber: text("iot_number"),
  assetCategory: text("asset_category").notNull(),
  // battery, charger, soc-meter, harness
  franchiseId: integer("franchise_id").references(() => franchises.id),
  status: text("status").notNull().default("pending"),
  // pending, verified, mismatch
  assetStatus: text("asset_status"),
  // rtb-franchise, rmt-franchise, deployed-driver, etc.
  qrCodeAvailable: boolean("qr_code_available").default(false),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  franchiseId: integer("franchise_id").references(() => franchises.id),
  kaeId: integer("kae_id").references(() => users.id),
  status: text("status").notNull().default("in-progress"),
  // in-progress, completed, signed-off
  totalAssets: integer("total_assets").notNull().default(0),
  verifiedAssets: integer("verified_assets").notNull().default(0),
  pendingAssets: integer("pending_assets").notNull().default(0),
  mismatchAssets: integer("mismatch_assets").notNull().default(0),
  socMeterCount: integer("soc_meter_count").default(0),
  harnessCount: integer("harness_count").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at")
});
var auditEntries = pgTable("audit_entries", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").references(() => audits.id),
  assetId: integer("asset_id").references(() => assets.id),
  verificationMethod: text("verification_method").notNull(),
  // qr-scan, manual-entry
  serialNumberScanned: text("serial_number_scanned"),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  auditedAt: timestamp("audited_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true
});
var insertFranchiseSchema = createInsertSchema(franchises).omit({
  id: true
});
var insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  startedAt: true,
  completedAt: true
});
var insertAuditEntrySchema = createInsertSchema(auditEntries).omit({
  id: true,
  auditedAt: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/franchise/:id", async (req, res) => {
    try {
      const franchiseId = parseInt(req.params.id);
      const franchise = await storage.getFranchise(franchiseId);
      if (!franchise) {
        return res.status(404).json({ message: "Franchise not found" });
      }
      res.json(franchise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch franchise data" });
    }
  });
  app2.get("/api/assets/franchise/:franchiseId", async (req, res) => {
    try {
      const franchiseId = parseInt(req.params.franchiseId);
      const assets2 = await storage.getAssetsByFranchise(franchiseId);
      res.json(assets2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });
  app2.get("/api/audit/franchise/:franchiseId", async (req, res) => {
    try {
      const franchiseId = parseInt(req.params.franchiseId);
      const audit = await storage.getAuditByFranchise(franchiseId);
      if (!audit) {
        return res.status(404).json({ message: "No active audit found" });
      }
      res.json(audit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit data" });
    }
  });
  app2.patch("/api/assets/:id", async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const updates = req.body;
      const updatedAsset = await storage.updateAsset(assetId, updates);
      if (!updatedAsset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(updatedAsset);
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset" });
    }
  });
  app2.post("/api/audit-entries", async (req, res) => {
    try {
      const validatedData = insertAuditEntrySchema.parse(req.body);
      const auditEntry = await storage.createAuditEntry(validatedData);
      res.json(auditEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid audit entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create audit entry" });
    }
  });
  app2.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create asset" });
    }
  });
  app2.patch("/api/audits/:id", async (req, res) => {
    try {
      const auditId = parseInt(req.params.id);
      const updates = req.body;
      const updatedAudit = await storage.updateAudit(auditId, updates);
      if (!updatedAudit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      res.json(updatedAudit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update audit" });
    }
  });
  app2.post("/api/upload", async (req, res) => {
    res.json({ url: "/uploads/asset-photo-" + Date.now() + ".jpg" });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  base: "/batteryaudit3/",
  // ✅ GitHub Pages path
  root: path.resolve(__dirname, "client"),
  // ✅ client is your app root
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    // ✅ final dist folder for gh-pages
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
