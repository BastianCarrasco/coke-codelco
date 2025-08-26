// index.ts (este archivo debe estar en la raíz de tu proyecto)
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors"; // Importa el plugin CORS
import { excelPlugin } from "./src/excel-plugin"; // Importa tu plugin de Excel

const app = new Elysia();

// 1. Habilitar CORS (¡Ahora completamente genérico!)
// Esto permitirá solicitudes desde CUALQUIER origen.
// Ideal para desarrollo/pruebas o APIs públicas sin restricciones de origen.
// Para producción, se recomienda restringir a los dominios específicos de tu frontend.
app.use(
  cors({
    origin: "true", // <--- CAMBIO AQUÍ: Usa '*' para permitir CUALQUIER origen.
    // Alternativamente, puedes usar `origin: true` que también funciona
    // para permitir el origen de la solicitud entrante.
    methods: ["GET", "PUT", "POST", "DELETE"], // Permite estos métodos
    allowedHeaders: ["Content-Type", "Authorization"], // Permite estos encabezados
    credentials: true, // Si necesitas enviar cookies o encabezados de autorización en peticiones cross-origin
  })
);

// 2. Configuración de Swagger
app.use(
  swagger({
    path: "/swagger",
    documentation: {
      info: {
        title: "API para Gestión de Documentos Excel - Coke Codelco",
        version: "1.0.0",
        description: "API para ver, modificar y descargar Caratula.xlsx.",
      },
      tags: [
        { name: "Caratula.xlsx", description: "Operaciones del archivo Excel" },
        { name: "Saludo", description: "Endpoints de prueba de saludo" },
      ],
    },
  })
);

// 3. Integrar el plugin de Excel
app.use(excelPlugin); // Esto montará todas las rutas de excelPlugin bajo /j31

// --- Endpoint de Saludo ---
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
