const { spawn } = require("child_process");
const path = require("path");

const port = process.env.PORT || 8080;
const supergatewayBin = path.join(__dirname, "node_modules", ".bin", "supergateway");
const mcpBin = path.join(__dirname, "node_modules", ".bin", "mcp-server-azuredevops");

const args = [
  "--stdio",
  `${mcpBin} agentiqai --authentication envvar -d core work work-items search`,
  "--outputTransport", "streamableHttp",
  "--port", String(port),
  "--cors",
];

console.log(`Starting supergateway on port ${port}...`);

const child = spawn(supergatewayBin, args, {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

child.on("error", (err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

child.on("exit", (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code || 0);
});
