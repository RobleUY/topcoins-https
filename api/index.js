export default async function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

 
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  
  const TARGET_BASE = "http://june.hidencloud.com:25196";

  try {

    const endpoint = req.url.replace(/^\/api/, ''); 
    
   
    const urlOriginal = `${TARGET_BASE}${endpoint}`;

   
    const response = await fetch(urlOriginal, {
      method: req.method, 
    });

    
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      
      const data = await response.text();
      return res.status(response.status).send(data);
    }

  } catch (error) {
    console.error("Error en el proxy universal:", error);
    return res.status(500).json({ error: "Error al conectar con el servidor de RobleBOT" });
  }
}