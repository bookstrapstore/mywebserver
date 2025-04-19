// backend/server.js
const express = require("express");
const { Client } = require("basic-ftp");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" }); // Carpeta temporal para almacenar archivos

// Middleware para parsear JSON y form-data
app.use(express.json());

// Endpoint para subir archivos
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    // Subir archivo al hosting gratuito de InfinityFree mediante FTP
    const client = new Client();
    await client.access({
      host: "ftpupload.net", // Host FTP proporcionado por InfinityFree
      user: "mseet_38778680", // Usuario FTP proporcionado por InfinityFree
      password: "o86AaBJ5LY1C", // Contraseña FTP proporcionada por InfinityFree
      secure: false, // Cambia a `true` si usas FTPS
    });

    // Subir el archivo a la carpeta /public_html/archivos_adjuntos/
    const remotePath = `/public_html/archivos_adjuntos/${file.originalname}`;
    await client.uploadFrom(file.path, remotePath);
    await client.close();

    // Eliminar archivo temporal
    require("fs").unlinkSync(file.path);

    // Generar la URL pública del archivo
    const archivoAdjuntoUrl = `http://http://siscomes.hstn.me/archivos_adjuntos/${file.originalname}`;

    res.json({ success: true, url: archivoAdjuntoUrl });
  } catch (err) {
    console.error("Error al subir archivo:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});