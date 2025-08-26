// app.js
const express = require("express");
const excelRoutes = require("./routes/excel.routes"); // Importar las rutas de Excel
// const fs = require('fs'); // No es necesario si no creas el directorio aquí
// const { EXCEL_DIR } = require('./config/constants'); // No es necesario aquí si no haces comprobaciones

const app = express();
const PORT = 3000;

// Middleware para parsear cuerpos JSON
app.use(express.json());

// *** Importante: Configurar CORS si el frontend estará en un dominio diferente ***
// Ejemplo básico de CORS:
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite cualquier origen (ajustar en producción)
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    // Manejar peticiones OPTIONS pre-vuelo para CORS
    return res.sendStatus(200);
  }
  next();
});

// Usar las rutas de Excel
// Puedes prefijar las rutas, por ejemplo, todas bajo /excel
app.use("/excel", excelRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
