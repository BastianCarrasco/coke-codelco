// routes/excel.routes.js
const express = require("express");
const router = express.Router();
const excelController = require("../controllers/excel.controller");
const upload = require("../utils/multer"); // Importar la configuración de multer

// Ruta para subir un archivo Excel
router.post("/upload", upload.single("excelFile"), excelController.uploadExcel);

// Ruta para descargar un archivo Excel
router.get("/download/:filename", excelController.downloadExcel);

// Ruta para editar una celda por su notación A1
router.put("/edit-cell-a1/:filename", excelController.editCellA1);

module.exports = router;
