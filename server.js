const { spawn } = require("child_process");
const http = require("http");

const port = process.env.PORT || 8080;

// Health check server - Azure warmup probe pings "/"
// This must respond quickly so Azure knows the container is alive
const healthServer = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  }
});

healthServer.listen(port, () => {
  console.log(`Health check listening on port ${port}`);

  // Start supergateway after warmup probe passes
  const args = [
    "--stdio",
    "mcp-server-azuredevops agentiqai --authentication envvar -d core work work-items search",
    "--outputTransport", "streamableHttp",
    "--port", String(port),
    "--cors",
  ];

  console.log(`Starting supergateway on port ${port}...`);

  // Give Azure time to pass the warmup probe, then hand over the port
  setTimeout(() => {
    healthServer.close(() => {
      console.log("Health server closed, starting supergateway...");
      const child = spawn("supergateway", args, {
        stdio: "inherit",
        env: process.env,
        shell: true,
      });

      child.on("error", (err) => {
        console.error("Failed to start supergateway:", err);
        process.exit(1);
      });

      child.on("exit", (code) => {
        console.log(`Supergateway exited with code ${code}`);
        process.exit(code || 0);
      });
    });
  }, 5000);
});
