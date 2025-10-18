# AgroTrack - Portal Interno (MVP)

**Alumno:** Alejandra Labra  
**Legajo:** 35418640

## 🚀 Cómo ejecutar
```bash
node server.js
```
Abrí el navegador en: **http://localhost:8888**

## 📌 Rutas
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/` | GET | Página principal |
| `/productos.html` | GET | Información de productos |
| `/contacto.html` | GET | Formulario de contacto (alias limpio `/contacto`) |
| `/contacto` | GET | Alias sin extensión del formulario de contacto |
| `/contacto/cargar` | POST | Guarda consulta en `data/consultas.txt` |
| `/contacto/listar` | GET | Muestra consultas previas |
| `/login.html` | GET | Formulario de login (alias limpio `/login`) |
| `/login` | GET | Alias sin extensión del login |
| `/auth/recuperar` | POST | Procesa credenciales de demostración |

## 🧪 Ejemplos de salida

### Ejemplo de POST `/auth/recuperar`
Entrada (form):
- usuario: Juan
- clave: 1234

Salida (HTML):
```
Usuario: Juan
Clave: 1234
```

### Ejemplo de bloque en `consultas.txt`
```
-------------------------
Fecha: 2025-10-15 17:00
Nombre: Alejandra J Labra
Email: alejandralabra.at@gmail.com
Mensaje: Quisiera información sobre servicios.
-------------------------
```

## ⚙️ Detalles técnicos
- **Node.js puro**: módulos `http`, `fs`, `url`, `path` (sin Express).
- **Asincronía**: `fs.readFile` / `fs.appendFile`.
- **MIME**: mapeo manual (incluye `.svg`, `.webp`, `.woff2`).
- **Errores**: 404 y 500 con HTML amigable.
- **Persistencia**: `data/consultas.txt` (se crea al primer envío).
- **Rutas limpias**: alias `/login` y `/contacto` requeridos por el enunciado.

## 📦 Estructura
```
agrotrack/
├─ server.js
├─ public/
│  ├─ index.html
│  ├─ productos.html
│  ├─ contacto.html
│  ├─ login.html
│  └─ estilos.css
├─ data/
│  └─ consultas.txt  (auto-generado)
├─ .gitignore
├─ README.md
└─ AgroTrack.postman_collection.json
```

## 📮 Repositorio público
Subí este proyecto a **GitHub** o **GitLab** y agregá acá la URL del repo:
- URL del repositorio: *https://github.com/AleLabra/Agrotrack?tab=readme-ov-file*
