const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 8888;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
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
        const html404 = renderPage({
          title: "Página no encontrada — AgroTrack",
          heading: "404 — Página no encontrada",
          body: `<p>La ruta solicitada no existe o cambió de ubicación.</p>`,
          actions: `<a class="btn" href="/">Volver al inicio</a>`
        });
        return send(res, 404, "text/html; charset=utf-8", html404);
      } else {
        console.error("Error leyendo archivo:", err);
        const html500 = renderPage({
          title: "Error interno — AgroTrack",
          heading: "Error interno del servidor",
          body: `<p>Ocurrió un problema al procesar tu solicitud.</p>`,
          actions: `<a class="btn" href="/">Volver al inicio</a>`
        });
        return send(res, 500, "text/html; charset=utf-8", html500);
      }
    }
    const ext = path.extname(filePath);
    const type = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

function ensureDataDir() {
  const dir = path.join(__dirname, "data");
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
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

function renderPage({ title, heading, body, actions = "" }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/estilos.css" />
  <title>${title}</title>
</head>
<body>
  <header class="site">
    <div class="inner">
      <div class="brand"><div class="logo" aria-hidden="true"></div> AgroTrack</div>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto">Contacto</a>
        <a href="/login">Login</a>
      </nav>
    </div>
  </header>
  <div class="container">
    <div class="card" style="max-width:720px;margin-inline:auto">
      <h1>${heading}</h1>
      ${body}
      <div class="row" style="margin-top:12px">
        ${actions}
      </div>
    </div>
    <div class="footer">MVP académico — Node.js puro (http, fs, url, path)</div>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const method = req.method;

  console.log(new Date().toISOString(), method, pathname);

  // Aliases
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
      const html404 = renderPage({
        title: "Página no encontrada — AgroTrack",
        heading: "404 — Página no encontrada",
        body: `<p>La ruta solicitada no existe o cambió de ubicación.</p>`,
        actions: `<a class="btn" href="/">Volver al inicio</a>`
      });
      return send(res, 404, "text/html; charset=utf-8", html404);
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
        const html400 = renderPage({
          title: "Datos inválidos — AgroTrack",
          heading: "Faltan datos",
          body: `<p>Completá <strong>usuario</strong> y <strong>clave</strong> para continuar.</p>`,
          actions: `<a class="btn" href="/login">Volver</a>`
        });
        return send(res, 400, "text/html; charset=utf-8", html400);
      }

      const html = renderPage({
        title: "Acceso — AgroTrack",
        heading: "Datos recibidos",
        body: `<p><strong>Usuario:</strong> ${usuario}</p><p><strong>Clave:</strong> ${clave}</p>`,
        actions: `<a class="btn outline" href="/">Ir al inicio</a>`
      });
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
        const html400 = renderPage({
          title: "Datos inválidos — AgroTrack",
          heading: "Faltan datos",
          body: `<p>Completá <strong>nombre</strong>, <strong>email</strong> y <strong>mensaje</strong> para continuar.</p>`,
          actions: `<a class="btn" href="/contacto">Volver al formulario</a>`
        });
        return send(res, 400, "text/html; charset=utf-8", html400);
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
            const html500 = renderPage({
              title: "Error interno — AgroTrack",
              heading: "Error interno del servidor",
              body: `<p>Ocurrió un problema al guardar tu consulta.</p>`,
              actions: `<a class="btn" href="/">Volver al inicio</a>`
            });
            return send(res, 500, "text/html; charset=utf-8", html500);
          }
          const html = renderPage({
            title: "Contacto enviado — AgroTrack",
            heading: `¡Gracias por contactarte, ${nombre}!`,
            body: `<div class="notice success"><p>Tu consulta fue registrada correctamente.</p></div>
                   <p>En breve nos pondremos en contacto a <strong>${email}</strong>.</p>`,
            actions: `
              <a class="btn" href="/contacto">Volver al formulario</a>
              <a class="btn mint" href="/contacto/listar">Ver consultas</a>
              <a class="btn outline" href="/">Ir al inicio</a>
            `
          });
          return send(res, 200, "text/html; charset=utf-8", html);
        });
      } catch (e) {
        console.error("Error general grabando consulta:", e);
        const html500 = renderPage({
          title: "Error interno — AgroTrack",
          heading: "Error interno del servidor",
          body: `<p>Ocurrió un problema al procesar tu solicitud.</p>`,
          actions: `<a class="btn" href="/">Volver al inicio</a>`
        });
        return send(res, 500, "text/html; charset=utf-8", html500);
      }
    });
    return;
  }

  // GET /contacto/listar
  if (method === "GET" && pathname === "/contacto/listar") {
    const file = path.join(__dirname, "data", "consultas.txt");
    fs.readFile(file, "utf-8", (err, data) => {
      if (err || !data || !data.trim()) {
        const html = renderPage({
          title: "Consultas — AgroTrack",
          heading: "Consultas recibidas",
          body: `<div class="notice"><p>Aún no hay consultas.</p></div>`,
          actions: `<a class="btn" href="/contacto">Volver al formulario</a>`
        });
        return send(res, 200, "text/html; charset=utf-8", html);
      }
      const html = renderPage({
        title: "Consultas — AgroTrack",
        heading: "Consultas recibidas",
        body: `<pre>${data}</pre>`,
        actions: `
          <a class="btn" href="/contacto">Cargar otra consulta</a>
          <a class="btn outline" href="/">Ir al inicio</a>
        `
      });
      return send(res, 200, "text/html; charset=utf-8", html);
    });
    return;
  }

  // 404
  const html404 = renderPage({
    title: "Página no encontrada — AgroTrack",
    heading: "404 — Página no encontrada",
    body: `<p>La ruta solicitada no existe o cambió de ubicación.</p>`,
    actions: `<a class="btn" href="/">Volver al inicio</a>`
  });
  return send(res, 404, "text/html; charset=utf-8", html404);
});

server.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
