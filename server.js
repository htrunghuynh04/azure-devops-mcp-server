const { spawn } = require("child_process");

const port = process.env.PORT || 8080;

const cmd = `npx supergateway --stdio "npx mcp-server-azuredevops agentiqai --authentication envvar -d core work work-items search" --outputTransport streamableHttp --port ${port} --cors`;

console.log(`Starting: ${cmd}`);

const child = spawn(cmd, {
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
