const { spawn } = require("child_process");
const http = require("http");

const port = process.env.PORT || 8080;
const sgPort = 8081;

// Persistent health + proxy server on PORT (Azure warmup probe hits this)
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }
  // Proxy all other requests to supergateway
  const options = {
    hostname: "127.0.0.1",
    port: sgPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxy.on("error", () => {
    res.writeHead(502);
    res.end("Supergateway not ready");
  });
  req.pipe(proxy);
});

server.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);

  const args = [
    "--stdio",
    "mcp-server-azuredevops agentiqai --authentication envvar -d core work work-items search",
    "--outputTransport", "streamableHttp",
    "--port", String(sgPort),
    "--cors",
  ];

  console.log(`Starting supergateway on port ${sgPort}...`);

  const child = spawn("supergateway", args, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  child.on("error", (err) => {
    console.error("Failed to start supergateway:", err);
  });

  child.on("exit", (code) => {
    console.log(`Supergateway exited with code ${code}`);
    process.exit(code || 0);
  });
});
