const { spawn } = require("child_process");

const port = process.env.PORT || 8080;
const org = process.env.AZURE_DEVOPS_ORG;

if (!org) {
  console.error("❌ Thiếu biến môi trường AZURE_DEVOPS_ORG");
  process.exit(1);
}

console.log(`🚀 Starting Azure DevOps MCP Server...`);
console.log(`   Org: ${org}`);
console.log(`   Port: ${port}`);

const child = spawn(
  "npx",
  [
    "-y", "supergateway",
    "--stdio", `npx -y @azure-devops/mcp ${org}`,
    "--outputTransport", "streamableHttp",
    "--port", String(port),
    "--cors",
    "--healthEndpoint", "/health",
  ],
  {
    stdio: "inherit",
    env: process.env,
    shell: true,
  }
);

child.on("error", (err) => {
  console.error("❌ Failed to start supergateway:", err);
  process.exit(1);
});

child.on("exit", (code) => {
  console.log(`Supergateway exited with code ${code}`);
  process.exit(code || 0);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  child.kill("SIGTERM");
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  child.kill("SIGINT");
});
