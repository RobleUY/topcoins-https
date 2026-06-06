export const config = {
  runtime: 'edge', // Convierte el código a Edge: consumo mínimo y ultra velocidad
};

export default async function handler(req) {
  // Configuración de cabeceras CORS para permitir conexiones externas limpias
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Responder de inmediato a las peticiones de control de los navegadores (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const urlObj = new URL(req.url);
    
    // Extraemos la ruta limpia eliminando el "/api/" inicial
    // Ejemplo: si entran a "/api/24629/subbot?id=1", queda "24629/subbot?id=1"
    const rutaLimpia = urlObj.pathname.replace(/^\/api\//, '');
    
    // Separamos el primer elemento para identificar el puerto deseado
    const partes = rutaLimpia.split('/');
    const puertoDestino = partes[0]; // Captura "24629" o "25196"
    
    // Validamos que el puerto solicitado sea uno de tus dos puertos reales
    if (puertoDestino !== '24629' && puertoDestino !== '25196') {
      return new Response(JSON.stringify({ 
        error: "Puerto inválido. Debes incluir el puerto en la URL. Ejemplo: /api/24629/metrics" 
      }), { status: 400, headers: corsHeaders });
    }

    // Reconstruimos el resto de la ruta del endpoint original
    // Ejemplo: de "24629/subbot" extrae "/subbot"
    const endpointOriginal = rutaLimpia.substring(puertoDestino.length);

    // Construimos la URL HTTP final hacia tu proveedor HidenCloud incorporando los parámetros de búsqueda (?id=, etc)
    const urlOriginal = `http://hidencloud.com:${puertoDestino}${endpointOriginal}${urlObj.search}`;

    // Ejecutamos la consulta HTTP interna manteniendo el método original (GET o POST)
    const response = await fetch(urlOriginal, {
      method: req.method,
      // Si es un método POST, replicamos el cuerpo de la petición de forma segura
      body: req.method === 'POST' ? await req.text() : null 
    });

    // Identificamos el tipo de contenido que devolvió tu bot
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: response.status, headers: corsHeaders });
    } else {
      // Si devuelve texto plano o HTML de error, lo enviamos de vuelta como texto sin romper la app
      const textData = await response.text();
      const textHeaders = { ...corsHeaders, 'Content-Type': 'text/plain' };
      return new Response(textData, { status: response.status, headers: textHeaders });
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Error al conectar con el servidor de RobleBOT", 
      detalle: error.message 
    }), { status: 500, headers: corsHeaders });
  }
}
