const { spawn } = require("child_process");

const port = process.env.PORT || 8080;

if (!process.env.AZURE_DEVOPS_ORG_URL) {
  console.error("❌ Thiếu biến môi trường AZURE_DEVOPS_ORG_URL");
  process.exit(1);
}

if (!process.env.AZURE_DEVOPS_PAT) {
  console.error("❌ Thiếu biến môi trường AZURE_DEVOPS_PAT");
  process.exit(1);
}

console.log(`🚀 Starting Azure DevOps MCP Server...`);
console.log(`   Org URL: ${process.env.AZURE_DEVOPS_ORG_URL}`);
console.log(`   Port: ${port}`);

const child = spawn(
  "supergateway",
  [
    "--stdio", "npx --yes @tiberriver256/mcp-server-azure-devops",
    "--outputTransport", "streamableHttp",
    "--stateful",
    "--sessionTimeout", "3600000",
    "--port", String(port),
    "--cors",
    "--healthEndpoint", "/health",
  ],
  {
    stdio: "inherit",
    env: { ...process.env },
    shell: false,
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

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  child.kill("SIGTERM");
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  child.kill("SIGINT");
});
