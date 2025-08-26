// src/excel-plugin.ts
import { Elysia, t } from "elysia";
import ExcelJS from "exceljs";
import path from "path";

// --- Configuración de la ruta del archivo Excel ---
const EXCEL_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "docs",
  "Caratula.xlsx"
);
const SHEET_NAME = "Caratula EDP 31"; // ¡AJUSTA SI ES DIFERENTE!
const CELL_TO_MODIFY = "J31"; // ¡AJUSTA SI ES DIFERENTE!

// Definir el plugin de Elysia para las operaciones de Excel
export const excelPlugin = new Elysia({ prefix: "/j31" }) // El prefijo /j31 se aplica a todas las rutas de este plugin
  .group(
    "/excel",
    (
      app // Agrupar las rutas del Excel bajo /j31/excel
    ) =>
      app
        // GET /j31/excel - Obtener el contenido actual de la celda J31
        .get(
          "/", // Ruta final será /j31/excel
          async () => {
            try {
              const workbook = new ExcelJS.Workbook();
              await workbook.xlsx.readFile(EXCEL_FILE_PATH);

              const worksheet = workbook.getWorksheet(SHEET_NAME);
              if (!worksheet) {
                return new Response(
                  `La hoja '${SHEET_NAME}' no fue encontrada.`,
                  {
                    status: 404,
                  }
                );
              }

              const cell = worksheet.getCell(CELL_TO_MODIFY);
              return { content: cell.value ? String(cell.value) : "" };
            } catch (error) {
              console.error(
                "Error al leer el archivo Excel o la celda:",
                error
              );
              return new Response("Error interno del servidor al leer Excel", {
                status: 500,
              });
            }
          },
          {
            detail: {
              summary: `Obtener contenido de la celda ${CELL_TO_MODIFY}`,
              description: `Retorna el valor actual de la celda ${CELL_TO_MODIFY} en la hoja '${SHEET_NAME}' de Caratula.xlsx.`,
              tags: ["Caratula.xlsx"],
              responses: {
                200: {
                  description: `Contenido de la celda ${CELL_TO_MODIFY}`,
                  content: {
                    "application/json": {
                      schema: t.Object({ content: t.String() }).schema,
                    },
                  },
                },
                404: { description: "Hoja no encontrada" },
                500: { description: "Error interno del servidor" },
              },
            },
          }
        )

        // PUT /j31/excel - Modificar el contenido de la celda J31
        .put(
          "/", // Ruta final será /j31/excel
          async ({ body, set }) => {
            try {
              const workbook = new ExcelJS.Workbook();
              await workbook.xlsx.readFile(EXCEL_FILE_PATH);

              const worksheet = workbook.getWorksheet(SHEET_NAME);
              if (!worksheet) {
                set.status = 404;
                return {
                  message: `La hoja '${SHEET_NAME}' no fue encontrada.`,
                };
              }

              const cell = worksheet.getCell(CELL_TO_MODIFY);
              cell.value = body.newValue;

              await workbook.xlsx.writeFile(EXCEL_FILE_PATH);

              set.status = 200;
              return {
                message: `Celda ${CELL_TO_MODIFY} actualizada correctamente.`,
              };
            } catch (error) {
              console.error(
                "Error al escribir en el archivo Excel o la celda:",
                error
              );
              set.status = 500;
              return { message: "Error al actualizar la celda." };
            }
          },
          {
            body: t.Object({
              newValue: t.String({
                description: `El nuevo texto para la celda ${CELL_TO_MODIFY}.`,
              }),
            }),
            detail: {
              summary: `Actualizar contenido de la celda ${CELL_TO_MODIFY}`,
              description: `Modifica el valor de la celda ${CELL_TO_MODIFY} en la hoja '${SHEET_NAME}' de Caratula.xlsx.`,
              tags: ["Caratula.xlsx"],
              responses: {
                200: { description: "Celda actualizada exitosamente" },
                404: { description: "Hoja no encontrada" },
                500: { description: "Error al actualizar la celda" },
              },
            },
          }
        )
        // NUEVO ENDPOINT: GET /j31/excel/download - Descargar el archivo Excel
        .get(
          "/download", // Ruta final será /j31/excel/download
          async ({ set }) => {
            try {
              const workbook = new ExcelJS.Workbook();
              await workbook.xlsx.readFile(EXCEL_FILE_PATH);

              // Escribir el libro de trabajo en un buffer
              const buffer = await workbook.xlsx.writeBuffer();

              set.headers = {
                "Content-Type":
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="Caratula_EDP_31.xlsx"`,
                "Content-Length": buffer.byteLength,
              };
              return new Response(buffer); // Devolver el buffer como respuesta
            } catch (error) {
              console.error("Error al descargar el archivo Excel:", error);
              set.status = 500;
              return { message: "Error al descargar el archivo Excel." };
            }
          },
          {
            detail: {
              summary: "Descargar Caratula.xlsx",
              description: "Permite descargar el archivo Caratula.xlsx actual.",
              tags: ["Caratula.xlsx"],
              responses: {
                200: {
                  description: "Archivo Excel descargado exitosamente",
                  content: {
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                      {
                        schema: { type: "string", format: "binary" },
                      },
                  },
                },
                500: { description: "Error al descargar el archivo" },
              },
            },
          }
        )
  );
