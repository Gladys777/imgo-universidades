import { spawn } from "node:child_process";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed with ${code}`))));
  });
}

async function main() {
  await run("node", ["scripts/build-snies.mjs"]);
  await run("node", ["scripts/build-sena.mjs"]);
  await run("node", ["scripts/merge-sena-into-universities.mjs"]);
  console.log("✅ Data completa generada (SNIES + SENA integrado en la UI).");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
