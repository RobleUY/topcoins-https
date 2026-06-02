export default async function handler(req, res) {
  // 1. Configurar cabeceras CORS universales
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si Chrome hace una petición de control (OPTIONS), respondemos OK de inmediato
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Base de tu servidor Hidencloud
  const TARGET_BASE = "http://june.hidencloud.com:25196";

  try {
    // 2. Capturar la URL completa que llegó a Next.js (ej: /api/topdinero?apodo=X&pos=1)
    // Limpiamos el prefijo '/api' para quedarnos solo con el endpoint real y sus queries
    const endpoint = req.url.replace(/^\/api/, ''); 
    
    // Concatener la base con el endpoint y sus parámetros idénticos
    const urlOriginal = `${TARGET_BASE}${endpoint}`;

    // 3. Hacer la petición espejo hacia tu servidor Hidencloud
    const response = await fetch(urlOriginal, {
      method: req.method, // Mantiene GET (o POST si llegas a usarlo)
    });

    // 4. Detectar qué tipo de archivo responde el servidor (JSON o Texto/HTML)
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      // Esto sirve para cuando pidas /menu.txt u otros archivos de texto plano
      const data = await response.text();
      return res.status(response.status).send(data);
    }

  } catch (error) {
    console.error("Error en el proxy universal:", error);
    return res.status(500).json({ error: "Error al conectar con el servidor de RobleBOT" });
  }
}