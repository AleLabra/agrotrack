// Configuración inicial
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8888;


// Necesario para __dirname al usar ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware
app.use(logger);
app.use(express.json()); // API REST trabaja con JSON
app.use(express.urlencoded({ extended: true }));


// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));


// Endpoint raíz
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"));
});


// Endpoint healthcheck
app.get("/health", (req, res) => {
res.json({ status: "ok" });
});


// API REST
app.use("/api/contactos", contactosRouter);


// Middleware centralizado de errores
app.use(errorHandler);


// Servidor
app.listen(PORT, () => {
console.log(`Servidor iniciado en http://localhost:${PORT}`);
});