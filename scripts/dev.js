const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const backendDir = path.join(root, "backend");
const frontendDir = path.join(root, "frontend");

const backend = spawn(
  path.join(backendDir, "venv", "Scripts", "python.exe"),
  [path.join(backendDir, "app.py")],
  { cwd: backendDir, stdio: "inherit" }
);

const npm = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "dev"],
  { cwd: frontendDir, stdio: "inherit", shell: process.platform === "win32" }
);

const children = [backend, npm];
let stopping = false;

function stopOthers(exitedChild) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (child !== exitedChild && child.exitCode === null) {
      child.kill();
    }
  }
}

for (const child of children) {
  child.on("error", (error) => {
    console.error("Failed to start a server:", error.message);
    stopOthers(child);
  });

  child.on("exit", (code) => {
    if (!stopping) {
      console.log(`A server stopped (exit code: ${code}). Stopping the other server.`);
      stopOthers(child);
    }
  });
}

process.on("SIGINT", () => {
  stopOthers(null);
});
