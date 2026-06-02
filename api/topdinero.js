export default async function handler(req, res) {
  // 1. Configurar cabeceras CORS para que tu extensión pueda leer los datos sin bloqueos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si Chrome hace una petición de control (OPTIONS), respondemos OK de inmediato
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Capturar los parámetros de búsqueda que vengan de la extensión
  const { apodo, position } = req.query;
  
  let urlOriginal = "http://june.hidencloud.com:25196/topdinero";
  
  if (apodo) {
    urlOriginal += `?apodo=${encodeURIComponent(apodo)}`;
  } else if (position) {
    urlOriginal += `?position=${position}`;
  }

  try {
    // 3. Hacer la petición HTTP interna hacia tu servidor Hidencloud
    const response = await fetch(urlOriginal);
    const data = await response.json();
    
    // 4. Devolver los datos con código de éxito
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error al conectar con el servidor de RobleBOT" });
  }
}