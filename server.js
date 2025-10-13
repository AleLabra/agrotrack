// server.js (patched)
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 8888;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, code, type, body) {
  res.writeHead(code, { "Content-Type": type });
  res.end(body);
}

function serveStatic(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        send(res, 404, "text/html; charset=utf-8", "<h1>404 - Página no encontrada</h1><a href='/'>Volver al inicio</a>");
      } else {
        console.error("Error leyendo archivo:", err);
        send(res, 500, "text/html; charset=utf-8", "<h1>Error interno del servidor</h1>");
      }
      return;
    }
    const ext = path.extname(filePath);
    const type = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

function ensureDataDir() {
  const dir = path.join(__dirname, "data");
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
}

function formatFechaLocal() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day} ${h}:${min}`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const method = req.method;

  console.log(new Date().toISOString(), method, pathname);

  // Clean aliases
  if (pathname === "/login" && method === "GET") {
    return serveStatic(path.join(__dirname, "public", "login.html"), res);
  }
  if (pathname === "/contacto" && method === "GET") {
    return serveStatic(path.join(__dirname, "public", "contacto.html"), res);
  }

  // Static
  if (
    pathname === "/" ||
    pathname.endsWith(".html") || pathname.endsWith(".css") ||
    pathname.endsWith(".js")   || pathname.endsWith(".png") ||
    pathname.endsWith(".jpg")  || pathname.endsWith(".jpeg")||
    pathname.endsWith(".svg")  || pathname.endsWith(".webp")||
    pathname.endsWith(".ico")  || pathname.endsWith(".woff2")
  ) {
    const filePath =
      pathname === "/"
        ? path.join(__dirname, "public", "index.html")
        : path.join(__dirname, "public", pathname.replace(/^\//, ""));
    const publicRoot = path.join(__dirname, "public");
    if (!filePath.startsWith(publicRoot)) {
      return send(res, 404, "text/html; charset=utf-8", "<h1>404 - Página no encontrada</h1><a href='/'>Volver al inicio</a>");
    }
    return serveStatic(filePath, res);
  }

  // POST /auth/recuperar
  if (method === "POST" && pathname === "/auth/recuperar") {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const usuario = (params.get("usuario") || "").trim();
      const clave = (params.get("clave") || "").trim();

      if (!usuario || !clave) {
        return send(res, 400, "text/html; charset=utf-8",
          "<h1>Datos inválidos</h1><p>Completá usuario y clave.</p><a href='/login'>Volver</a>");
      }

      const html = `
        <h1>Datos recibidos</h1>
        <p><strong>Usuario:</strong> ${usuario}</p>
        <p><strong>Clave:</strong> ${clave}</p>
        <a href="/">Volver al inicio</a>
      `;
      return send(res, 200, "text/html; charset=utf-8", html);
    });
    return;
  }

  // POST /contacto/cargar
  if (method === "POST" && pathname === "/contacto/cargar") {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const nombre = (params.get("nombre") || "").trim();
      const email = (params.get("email") || "").trim();
      const mensaje = (params.get("mensaje") || "").trim();

      if (!nombre || !email || !mensaje) {
        return send(res, 400, "text/html; charset=utf-8",
          "<h1>Datos inválidos</h1><p>Completá nombre, email y mensaje.</p><a href='/contacto'>Volver</a>");
      }

      const fecha = formatFechaLocal();
      const texto = `
-------------------------
Fecha: ${fecha}
Nombre: ${nombre}
Email: ${email}
Mensaje: ${mensaje}
-------------------------
`;

      try {
        ensureDataDir();
        fs.appendFile(path.join(__dirname, "data", "consultas.txt"), texto, err => {
          if (err) {
            console.error("appendFile error:", err);
            return send(res, 500, "text/html; charset=utf-8", "<h1>Error interno del servidor</h1>");
          }
          const html = `
            <h1>Gracias por contactarte, ${nombre}!</h1>
            <p>Tu consulta fue registrada.</p>
            <a href="/contacto">Volver al formulario</a> | <a href="/contacto/listar">Ver consultas</a>
          `;
          return send(res, 200, "text/html; charset=utf-8", html);
        });
      } catch (e) {
        console.error("Error general grabando consulta:", e);
        return send(res, 500, "text/html; charset=utf-8", "<h1>Error interno del servidor</h1>");
      }
    });
    return;
  }

  // GET /contacto/listar
  if (method === "GET" && pathname === "/contacto/listar") {
    const file = path.join(__dirname, "data", "consultas.txt");
    fs.readFile(file, "utf-8", (err, data) => {
      if (err || !data || !data.trim()) {
        return send(res, 200, "text/html; charset=utf-8", "<h1>Aún no hay consultas.</h1><a href='/'>Volver al inicio</a>");
      }
      const html = `<h1>Consultas recibidas</h1><pre>${data}</pre><a href='/'>Volver al inicio</a>`;
      return send(res, 200, "text/html; charset=utf-8", html);
    });
    return;
  }

  // 404
  return send(res, 404, "text/html; charset=utf-8", "<h1>404 - Ruta no encontrada</h1><a href='/'>Volver al inicio</a>");
});

server.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
