export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  
  // Extraer el path después de /proxy/25196/
  const pathMatch = url.pathname.match(/\/proxy\/25196\/?(.*)$/);
  const targetPath = pathMatch && pathMatch[1] ? pathMatch[1] : '';
  
  // Construir la URL de destino (sin la barra final si targetPath está vacío)
  const targetUrl = targetPath 
    ? `http://june.hidencloud.com:25196/${targetPath}${url.search}`
    : `http://june.hidencloud.com:25196${url.search}`;
  
  try {
    // Hacer la petición al servidor HTTP original
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        host: 'june.hidencloud.com',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Crear nueva respuesta con los headers apropiados
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Error en el proxy',
        message: error.message,
        targetUrl 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
