import axios from "axios";

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    const { url } = event.queryStringParameters || {};
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "URL parameter is required" }),
      };
    }

    // Fetch the content from the provided URL
    const response = await axios.get(url, {
      responseType: "text",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const content = response.data;
    const contentType = response.headers["content-type"] || "application/vnd.apple.mpegurl";

    // If it's an M3U8 playlist, we need to process it to replace URLs
    if (contentType.includes("application/vnd.apple.mpegurl") || contentType.includes("text/plain")) {
      const processedContent = processM3U8Content(content, url);
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
        },
        body: processedContent,
      };
    }

    // For other content types, return as-is
    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": contentType,
      },
      body: content,
    };

  } catch (error) {
    console.error("Proxy error:", error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to proxy the request",
        details: error.message 
      }),
    };
  }
};

function processM3U8Content(content, baseUrl) {
  const lines = content.split("\n");
  const processedLines = [];
  
  for (let line of lines) {
    line = line.trim();
    
    if (line && !line.startsWith("#")) {
      // This is a URL line
      if (!line.startsWith("http://") && !line.startsWith("https://")) {
        // Relative URL, make it absolute
        const urlObj = new URL(baseUrl);
        if (line.startsWith("/")) {
          line = `${urlObj.protocol}//${urlObj.host}${line}`;
        } else {
          line = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.replace(/\/[^\/]*$/, "/")}${line}`;
        }
      }
      
      // Proxy this URL through our function
      const proxyUrl = `${process.env.URL || "http://localhost:8888"}/.netlify/functions/proxy?url=${encodeURIComponent(line)}`;
      line = proxyUrl;
    }
    
    processedLines.push(line);
  }
  
  return processedLines.join("\n");
} 