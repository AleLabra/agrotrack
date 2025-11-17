import { pool } from "../db.js";

const contactoService = {
  async crear({ nombre, email, mensaje }) {
    const sql = `INSERT INTO contactos (nombre, email, mensaje, fecha)
                 VALUES (?, ?, ?, NOW())`;

    const [result] = await pool.execute(sql, [nombre, email, mensaje]);

    return {
      id: result.insertId,
      nombre,
      email,
      mensaje,
      fecha: new Date().toISOString()
    };
  },

  async listar() {
    const sql = `SELECT id, nombre, email, mensaje, fecha
                 FROM contactos
                 ORDER BY fecha DESC`;

    const [rows] = await pool.execute(sql);
    return rows;
  }
};

export default contactoService;
