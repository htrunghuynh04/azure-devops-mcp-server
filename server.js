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
    "--stdio", "mcp-server-azure-devops",
    "--outputTransport", "streamableHttp",
    "--port", String(port),
    "--cors",
    "--healthEndpoint", "/health",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      // Map sang đúng tên biến mà @tiberriver256 yêu cầu
      AZURE_DEVOPS_PAT: process.env.AZURE_DEVOPS_PAT || process.env.AZURE_DEVOPS_EXT_PAT,
    },
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

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  child.kill("SIGTERM");
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down...");
  child.kill("SIGINT");
});
