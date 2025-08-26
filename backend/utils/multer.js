// utils/multer.js
const multer = require("multer");
const path = require("path");
const { EXCEL_DIR } = require("../config/constants"); // Importar el directorio

// Configuración de Multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, EXCEL_DIR); // Guarda los archivos subidos en el directorio configurado
  },
  filename: (req, file, cb) => {
    // Podrías añadir un timestamp o un UUID para evitar sobrescribir si es necesario
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
