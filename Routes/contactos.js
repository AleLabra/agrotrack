import express from "express";
import contactoService from "../services/contactoService.js";


const router = express.Router();


// GET /api/contactos
router.get("/", async (req, res, next) => {
try {
const contactos = await contactoService.listar();
res.json(contactos);
} catch (error) {
next(error);
}
});


// POST /api/contactos
router.post("/", async (req, res, next) => {
try {
const { nombre, email, mensaje } = req.body;


if (!nombre || !email || !mensaje) {
return res.status(400).json({ error: "Todos los campos son obligatorios" });
}


const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
if (!emailRegex.test(email)) {
return res.status(400).json({ error: "Formato de email inválido" });
}


const nuevo = await contactoService.crear({ nombre, email, mensaje });
res.status(201).json(nuevo);
} catch (error) {
next(error);
}
});


export default router;