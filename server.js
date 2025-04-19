const express = require("express");
const cors = require("cors"); // Middleware para manejar CORS
const { Client } = require("basic-ftp");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" }); // Carpeta temporal para almacenar archivos

// Middleware para parsear JSON y form-data
app.use(express.json());
app.use(cors()); // Habilitar CORS para permitir solicitudes desde el frontend

// Endpoint para subir archivos
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    // Validar que se haya proporcionado un archivo
    if (!file) {
      return res.status(400).json({ success: false, error: "No se proporcionó ningún archivo." });
    }

    // Subir archivo al hosting gratuito de InfinityFree mediante FTP
    const client = new Client();
    try {
      await client.access({
        host: "ftpupload.net", // Host FTP proporcionado por InfinityFree
        user: "mseet_38778680", // Usuario FTP proporcionado por InfinityFree
        password: "z5y0g49c", // Contraseña FTP proporcionada por InfinityFree
        secure: false, // Cambia a `true` si usas FTPS
      });

      // Subir el archivo a la carpeta /htdocs/archivos_adjuntos/
      const remotePath = `/htdocs/archivos_adjuntos/${file.originalname}`;
      await client.uploadFrom(file.path, remotePath);
      await client.close();
    } catch (ftpError) {
      console.error("Error durante la conexión FTP:", ftpError.message);
      return res.status(500).json({ success: false, error: "Error al subir el archivo al servidor FTP." });
    }

    // Eliminar archivo temporal
    try {
      fs.unlinkSync(file.path);
    } catch (unlinkError) {
      console.error("Error al eliminar el archivo temporal:", unlinkError.message);
    }

    // Generar la URL pública del archivo
    const archivoAdjuntoUrl = `http://siscomes.hstn.me/archivos_adjuntos/${file.originalname}`;

    res.json({ success: true, url: archivoAdjuntoUrl });
  } catch (err) {
    console.error("Error al procesar la solicitud:", err.message);
    res.status(500).json({ success: false, error: "Error interno del servidor." });
  }
});

// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
