export const config = {
  runtime: 'edge', 
};

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  
  const TARGET_BASE = "http://june.hidencloud.com:24629";

  try {
    const urlObj = new URL(req.url);
    
    
    const endpoint = urlObj.pathname.replace(/^\/api\/server25196/, ''); 
    
   
    const urlOriginal = `${TARGET_BASE}${endpoint}${urlObj.search}`;

    const response = await fetch(urlOriginal, { method: req.method });
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: response.status, headers: corsHeaders });
    } else {
      const textData = await response.text();
      return new Response(textData, { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error en el proxy universal 25196" }), { status: 500, headers: corsHeaders });
  }
}
