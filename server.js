const { spawn } = require("child_process");
const http = require("http");

const port = process.env.PORT || 8080;

// Quick health server to pass Azure warmup probe
const health = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
});

health.listen(port, () => {
  console.log(`Health server on port ${port}, waiting for warmup probe...`);

  // After 3s, close health server and start supergateway on same port
  setTimeout(() => {
    health.close(() => {
      console.log("Health server closed, starting supergateway...");

      const child = spawn("supergateway", [
        "--stdio",
        "mcp-server-azuredevops agentiqai --authentication envvar -d core work work-items search",
        "--outputTransport", "streamableHttp",
        "--port", String(port),
        "--cors",
        "--healthEndpoint", "/health",
      ], {
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
  }, 3000);
});
