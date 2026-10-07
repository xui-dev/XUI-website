#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Colors for terminal formatting
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

const BANNER = `
${c.cyan}${c.bright}  ✦  XUI CLI${c.reset} ${c.dim}— High-Performance Kinetic Components${c.reset}
`;

// Priority URLs for fetching registry:
// 1. Env override if defined
// 2. Production Vercel domain
// 3. GitHub Raw from public repo xui-dev/XUI-components-
// 4. Localhost dev server fallback
const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/xui-dev/XUI-components-/main";
const PROD_API_BASE = "https://xui.dev/api/registry";
const LOCAL_API_BASE = "http://localhost:3000/api/registry";

async function fetchComponent(name) {
  const sources = [
    `${PROD_API_BASE}/${name}`,
    `${LOCAL_API_BASE}/${name}`,
    `${GITHUB_RAW_BASE}/components/${name}/meta.json`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        // If from GitHub raw, fetch the accompanying index.tsx
        if (url.includes("raw.githubusercontent.com") && !data.files?.[0]?.content) {
          const codeRes = await fetch(
            `${GITHUB_RAW_BASE}/components/${name}/index.tsx`,
            { signal: AbortSignal.timeout(3500) }
          );
          if (codeRes.ok) {
            const code = await codeRes.text();
            data.files = [
              {
                name: `${name}.tsx`,
                content: code,
                target: `components/xui/${name}.tsx`,
              },
            ];
          }
        }
        return data;
      }
    } catch {
      // Try next source
    }
  }
  return null;
}

async function fetchCatalog() {
  const sources = [
    PROD_API_BASE,
    LOCAL_API_BASE,
    `${GITHUB_RAW_BASE}/registry.json`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Try next
    }
  }
  return null;
}

function detectPackageManager(cwd) {
  if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) {
    return "bun";
  }
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}

function getInstallCommand(pm, packages) {
  const pkgStr = packages.join(" ");
  switch (pm) {
    case "bun":
      return `bun add ${pkgStr}`;
    case "pnpm":
      return `pnpm add ${pkgStr}`;
    case "yarn":
      return `yarn add ${pkgStr}`;
    default:
      return `npm install ${pkgStr}`;
  }
}

async function handleAdd(componentName) {
  if (!componentName) {
    console.error(`\n${c.red}✖ Please specify a component name.${c.reset}`);
    console.log(`\nUsage: ${c.cyan}npx xui add <component-name>${c.reset}`);
    console.log(`Example: ${c.dim}npx xui add dynamic-floating-dock${c.reset}\n`);
    process.exit(1);
  }

  const cwd = process.cwd();
  console.log(BANNER);
  console.log(`${c.blue}ℹ${c.reset} Resolving component ${c.bright}${componentName}${c.reset}...`);

  const component = await fetchComponent(componentName);

  if (!component) {
    console.error(
      `\n${c.red}✖ Component '${componentName}' not found in XUI registry.${c.reset}`
    );
    console.log(`Run ${c.cyan}npx xui list${c.reset} to see all available components.\n`);
    process.exit(1);
  }

  console.log(
    `${c.green}✔${c.reset} Found ${c.bright}${component.title || component.name}${c.reset} (${component.category || "ui"})`
  );

  // 1. Check dependencies
  const dependencies = component.dependencies || [];
  if (dependencies.length > 0) {
    const pkgJsonPath = path.join(cwd, "package.json");
    let missingDeps = [];

    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
        const installed = {
          ...(pkgJson.dependencies || {}),
          ...(pkgJson.devDependencies || {}),
        };
        missingDeps = dependencies.filter((dep) => !installed[dep]);
      } catch {
        missingDeps = dependencies;
      }
    } else {
      missingDeps = dependencies;
    }

    if (missingDeps.length > 0) {
      const pm = detectPackageManager(cwd);
      const installCmd = getInstallCommand(pm, missingDeps);
      console.log(
        `${c.yellow}⚡${c.reset} Installing missing dependencies: ${c.dim}${missingDeps.join(", ")}${c.reset}...`
      );
      try {
        execSync(installCmd, { cwd, stdio: "inherit" });
        console.log(`${c.green}✔${c.reset} Dependencies installed.`);
      } catch (err) {
        console.warn(
          `${c.yellow}⚠${c.reset} Could not auto-install dependencies. Please run:\n  ${c.cyan}${installCmd}${c.reset}`
        );
      }
    }
  }

  // 2. Determine target destination path
  const hasSrc = fs.existsSync(path.join(cwd, "src"));
  const baseComponentsDir = hasSrc
    ? path.join(cwd, "src", "components", "xui")
    : path.join(cwd, "components", "xui");

  fs.mkdirSync(baseComponentsDir, { recursive: true });

  const files = component.files || [];
  for (const file of files) {
    const fileName = file.name || `${componentName}.tsx`;
    const targetPath = path.join(baseComponentsDir, fileName);

    fs.writeFileSync(targetPath, file.content, "utf-8");

    const relativePath = path.relative(cwd, targetPath);
    console.log(`${c.green}✔${c.reset} Created ${c.bright}${relativePath}${c.reset}`);
  }

  console.log(`\n${c.green}${c.bright}✓ Success!${c.reset} Component ${c.cyan}${componentName}${c.reset} is ready to use.`);
  console.log(`\n${c.dim}Import it into your page:${c.reset}`);
  console.log(
    `  ${c.cyan}import ${component.title?.replace(/\s+/g, "") || "Component"} from "@/components/xui/${files[0]?.name?.replace(/\.tsx?$/, "") || componentName}";${c.reset}\n`
  );
}

async function handleList() {
  console.log(BANNER);
  console.log(`${c.blue}ℹ${c.reset} Fetching available components from XUI Registry...\n`);

  const catalog = await fetchCatalog();
  const items = catalog?.items || [
    {
      name: "dynamic-floating-dock",
      title: "Floating Liquid Dock",
      category: "Navbar",
      dependencies: ["lucide-react"],
    },
  ];

  console.log(`${c.bright}Available Components:${c.reset}\n`);

  for (const item of items) {
    console.log(
      `  ✦ ${c.bright}${item.name.padEnd(26)}${c.reset} [${c.cyan}${item.category || "UI"}${c.reset}]`
    );
    if (item.description) {
      console.log(`    ${c.dim}${item.description}${c.reset}`);
    }
    console.log(`    ${c.dim}Install:${c.reset} ${c.green}npx xui add ${item.name}${c.reset}\n`);
  }
}

function handleHelp() {
  console.log(BANNER);
  console.log(`Usage:`);
  console.log(`  ${c.cyan}npx xui add <component>${c.reset}    Install a component into your project`);
  console.log(`  ${c.cyan}npx xui list${c.reset}                 List all available components`);
  console.log(`  ${c.cyan}npx xui help${c.reset}                 Display this help menu\n`);
  console.log(`Examples:`);
  console.log(`  ${c.dim}npx xui add dynamic-floating-dock${c.reset}\n`);
}

// ── CLI Main Entry ──
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "add":
    handleAdd(args[1]);
    break;
  case "list":
  case "ls":
    handleList();
    break;
  case "help":
  case "--help":
  case "-h":
    handleHelp();
    break;
  default:
    if (!command) {
      handleHelp();
    } else {
      console.error(`\n${c.red}Unknown command: ${command}${c.reset}`);
      handleHelp();
      process.exit(1);
    }
    break;
}
