// index.ts (este archivo debe estar en la raíz de tu proyecto)
import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import ExcelJS from "exceljs"; // Importa ExcelJS
import path from "path";

const app = new Elysia();

// Configuración de Swagger
app.use(
  swagger({
    path: "/swagger",
    documentation: {
      info: {
        title: "API para Gestión de Documentos Excel - Coke Codelco",
        version: "1.0.0",
        description:
          "API para ver y modificar contenido en Caratula.xlsx (celda J31).",
      },
      tags: [
        { name: "Caratula.xlsx", description: "Operaciones del archivo Excel" },
        { name: "Saludo", description: "Endpoints de prueba de saludo" },
      ],
    },
  })
);

// --- Configuración de la ruta del archivo Excel ---
const EXCEL_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "docs",
  "Caratula.xlsx"
);
const SHEET_NAME = "Caratula EDP 31"; // Asume la primera hoja. ¡AJUSTA SI ES DIFERENTE!
const CELL_TO_MODIFY = "J31"; // La celda específica a modificar. ¡AJUSTA SI ES DIFERENTE!

// --- Endpoints para la Gestión del Excel ---

// GET /j31/excel - Obtener el contenido actual de la celda J31 en Caratula.xlsx
app.get(
  "/j31/excel",
  async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(EXCEL_FILE_PATH); // Lee el archivo Excel

      const worksheet = workbook.getWorksheet(SHEET_NAME);
      if (!worksheet) {
        return new Response(`La hoja '${SHEET_NAME}' no fue encontrada.`, {
          status: 404,
        });
      }

      const cell = worksheet.getCell(CELL_TO_MODIFY);
      return { content: cell.value ? String(cell.value) : "" }; // Retorna el valor de la celda
    } catch (error) {
      console.error("Error al leer el archivo Excel o la celda:", error);
      // Aquí puedes manejar diferentes tipos de errores, por ejemplo, si el archivo no existe
      return new Response("Error interno del servidor al leer Excel", {
        status: 500,
      });
    }
  },
  {
    detail: {
      summary: `Obtener contenido de la celda ${CELL_TO_MODIFY} en Caratula.xlsx`,
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
        404: {
          description: "Hoja no encontrada",
        },
        500: {
          description: "Error interno del servidor",
        },
      },
    },
  }
);

// PUT /j31/excel - Modificar el contenido de la celda J31 en Caratula.xlsx
app.put(
  "/j31/excel",
  async ({ body, set }) => {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(EXCEL_FILE_PATH); // Lee el archivo Excel

      const worksheet = workbook.getWorksheet(SHEET_NAME);
      if (!worksheet) {
        set.status = 404;
        return { message: `La hoja '${SHEET_NAME}' no fue encontrada.` };
      }

      const cell = worksheet.getCell(CELL_TO_MODIFY);
      cell.value = body.newValue; // Establece el nuevo valor de la celda

      await workbook.xlsx.writeFile(EXCEL_FILE_PATH); // Guarda los cambios en el archivo Excel

      set.status = 200; // OK
      return {
        message: `Celda ${CELL_TO_MODIFY} en Caratula.xlsx actualizada correctamente.`,
      };
    } catch (error) {
      console.error("Error al escribir en el archivo Excel o la celda:", error);
      set.status = 500;
      return { message: "Error al actualizar la celda en Caratula.xlsx." };
    }
  },
  {
    body: t.Object({
      newValue: t.String({
        description: `El nuevo texto para la celda ${CELL_TO_MODIFY}.`,
      }),
    }),
    detail: {
      summary: `Actualizar contenido de la celda ${CELL_TO_MODIFY} en Caratula.xlsx`,
      description: `Modifica el valor de la celda ${CELL_TO_MODIFY} en la hoja '${SHEET_NAME}' de Caratula.xlsx.`,
      tags: ["Caratula.xlsx"],
      responses: {
        200: {
          description: "Celda actualizada exitosamente",
          content: {
            "application/json": {
              schema: t.Object({ message: t.String() }).schema,
            },
          },
        },
        404: {
          description: "Hoja no encontrada",
        },
        500: {
          description: "Error al actualizar la celda",
        },
      },
    },
  }
);

// --- Endpoint de Saludo (para asegurar que la base funciona) ---

app.get(
  "/hello",
  () => {
    return "¡Hola! Desde Coke Codelco.";
  },
  {
    detail: {
      summary: "Endpoint de Saludo",
      description: "Retorna el mensaje '¡Hola! Desde Coke Codelco.'",
      tags: ["Saludo"],
      responses: {
        200: {
          description: "Saludo exitoso",
          content: {
            "text/plain": {
              schema: { type: "string", example: "¡Hola! Desde Coke Codelco." },
            },
          },
        },
      },
    },
  }
);

// Inicia el servidor
app.listen(3000, () => {
  console.log(
    `🦊 Elysia está corriendo en http://localhost:${app.server?.port}`
  );
  console.log(`¡Servidor Coke Codelco listo!`);
  console.log(
    `📄 Swagger UI disponible en http://localhost:${app.server?.port}/swagger`
  );
});
