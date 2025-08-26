// app.js (versión corregida)
const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const EXCEL_DIR = path.join(__dirname, "docs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, EXCEL_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use(express.json());

app.post("/upload", upload.single("excelFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se ha subido ningún archivo.");
  }
  res
    .status(200)
    .send(`Archivo "${req.file.originalname}" subido exitosamente a /docs.`);
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(EXCEL_DIR, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).send("Error al descargar el archivo.");
      }
    });
  } else {
    res.status(404).send("Archivo no encontrado.");
  }
});

app.put("/edit-cell-a1/:filename", async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(EXCEL_DIR, filename); // Esta es la línea que construye el path correctamente

  const { sheetName, cellA1, value } = req.body;

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`Archivo Excel no encontrado en: ${filePath}`);
  }
  if (!sheetName || !cellA1 || value === undefined) {
    return res
      .status(400)
      .send("Faltan parámetros: sheetName, cellA1 y value.");
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) {
      return res
        .status(404)
        .send(`Hoja de cálculo "${sheetName}" no encontrada.`);
    }

    const cell = worksheet.getCell(cellA1);
    cell.value = value;

    await workbook.xlsx.writeFile(filePath);

    // TODO: La línea C:\Users\rober\... no debe estar aquí. ¡Elimínala o coméntala!
    res
      .status(200)
      .send(
        `Celda "${cellA1}" en "${sheetName}" del archivo "${filename}" actualizada exitosamente a "${value}".`
      );
  } catch (error) {
    console.error("Error al editar el archivo Excel por referencia A1:", error);
    res
      .status(500)
      .send("Error interno del servidor al editar el archivo Excel.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
