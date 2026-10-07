import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { stripTypeScript } from "@/lib/registry";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      category,
      categoryLabel,
      dependencies,
      code,
      jsCode,
    } = body;

    // 1. Verify localhost access or admin session
    const host = request.headers.get("host") || "";
    const isLocalhost =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("::1") ||
      process.env.NODE_ENV === "development";

    if (!isLocalhost) {
      const supabase = await createClient();
      let authEmail: string | null = null;

      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { error: "Unauthorized: Admin actions are restricted to localhost or signed-in admin." },
            { status: 401 }
          );
        }

        authEmail = user.email || null;
        const adminEmail =
          process.env.ADMIN_EMAIL ||
          process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
          "xui.dev.off@gmail.com";

        if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
          return NextResponse.json(
            {
              error: `Access Denied: Only administrator (${adminEmail}) can publish components.`,
            },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Forbidden: Admin panel is restricted to localhost only." },
          { status: 403 }
        );
      }
    }

    if (!id || !title || !code) {
      return NextResponse.json(
        { error: "Missing required fields: id, title, and code are required." },
        { status: 400 }
      );
    }

    const cleanId = id
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/^-+|-+$/g, "");

    // Automatically detect imports from source code
    const autoDeps: string[] = [];
    const importRegex = /(?:import\s+(?:[\w\s{},*]+from\s+)?['"]|export\s+(?:[\w\s{},*]+from\s+)?['"])([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const specifier = match[1].trim();
      if (
        !specifier.startsWith(".") &&
        !specifier.startsWith("/") &&
        !specifier.startsWith("@/") &&
        !specifier.startsWith("http:") &&
        !specifier.startsWith("https:") &&
        specifier !== "react" &&
        !specifier.startsWith("react/") &&
        specifier !== "react-dom" &&
        !specifier.startsWith("react-dom/")
      ) {
        let pkgName = specifier;
        if (specifier.startsWith("@")) {
          const parts = specifier.split("/");
          pkgName = parts.slice(0, 2).join("/");
        } else {
          pkgName = specifier.split("/")[0];
        }
        if (pkgName && !autoDeps.includes(pkgName)) {
          autoDeps.push(pkgName);
        }
      }
    }

    const userDeps = Array.isArray(dependencies)
      ? dependencies
      : typeof dependencies === "string"
      ? dependencies.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const finalDeps = Array.from(new Set([...userDeps, ...autoDeps]));

    const finalJsCode = jsCode && jsCode.trim() ? jsCode : stripTypeScript(code);

    const cleanCategory = category === "footer" ? "button" : (category || "patterns");
    const cleanCategoryLabel =
      categoryLabel && categoryLabel.toLowerCase() !== "footer"
        ? categoryLabel
        : cleanCategory === "button"
        ? "Button"
        : category || "Patterns";

    // 2. Define metadata object
    const metaData = {
      name: cleanId,
      title,
      description: description || "",
      category: cleanCategory,
      categoryLabel: cleanCategoryLabel,
      author: body.author && typeof body.author === "string" && body.author.trim() ? body.author.trim() : "XUI",
      authorHandle: body.authorHandle && typeof body.authorHandle === "string" && body.authorHandle.trim() ? body.authorHandle.trim() : "@xui_dev",
      dependencies: finalDeps,
      registryDependencies: [],
      files: [
        {
          name: `${cleanId}.tsx`,
          path: `registry/components/${cleanId}/index.tsx`,
          target: `components/xui/${cleanId}.tsx`,
        },
        {
          name: `${cleanId}.jsx`,
          path: `registry/components/${cleanId}/index.jsx`,
          target: `components/xui/${cleanId}.jsx`,
        },
      ],
    };

    // 3. Write files locally into registry/components/[id]/ (Serverless-safe)
    const registryDir = path.join(process.cwd(), "registry");
    const componentDir = path.join(registryDir, "components", cleanId);
    const registryJsonPath = path.join(registryDir, "registry.json");

    let registryIndex = {
      name: "xui",
      homepage: "https://xui.dev",
      repository: "https://github.com/xui-dev/XUI-components-",
      version: "1.0.0",
      items: [] as any[],
    };

    try {
      await fs.mkdir(componentDir, { recursive: true });

      // Write TypeScript and React JSX source files
      await fs.writeFile(
        path.join(componentDir, "index.tsx"),
        code,
        "utf-8"
      );
      await fs.writeFile(
        path.join(componentDir, "index.jsx"),
        finalJsCode,
        "utf-8"
      );
      await fs.writeFile(
        path.join(componentDir, "meta.json"),
        JSON.stringify(metaData, null, 2),
        "utf-8"
      );

      // Update master registry.json
      try {
        const existingData = await fs.readFile(registryJsonPath, "utf-8");
        registryIndex = JSON.parse(existingData);
      } catch {
        // Create new
      }

      // Replace or append
      const existingIndex = (registryIndex.items || []).findIndex(
        (item: any) => item.name === cleanId
      );
      if (existingIndex >= 0) {
        registryIndex.items[existingIndex] = metaData;
      } else {
        if (!Array.isArray(registryIndex.items)) registryIndex.items = [];
        registryIndex.items.push(metaData);
      }

      await fs.writeFile(
        registryJsonPath,
        JSON.stringify(registryIndex, null, 2),
        "utf-8"
      );
    } catch (fsErr: any) {
      // In serverless environments (e.g. Vercel, AWS Lambda), the filesystem is read-only (EROFS).
      // We gracefully log a notice and continue with remote GitHub sync & cache invalidation.
      console.warn(
        "Local filesystem write skipped/failed (expected in serverless environments):",
        fsErr?.message
      );
    }

    // 4. If GitHub Token is provided, push directly to xui-dev/XUI-components-
    let githubStatus = "Saved locally in registry";
    let githubSynced = false;
    let githubError: string | null = null;
    const githubToken = process.env.GITHUB_TOKEN;

    if (githubToken) {
      try {
        const repoOwner = "xui-dev";
        const repoName = "XUI-components-";

        // Helper to commit a file to GitHub via REST API
        const commitFileToGitHub = async (filePath: string, fileContent: string) => {
          const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
          let sha: string | undefined;

          // Check if file exists to get sha
          const checkRes = await fetch(apiUrl, {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "XUI-Admin",
            },
          });

          if (checkRes.ok) {
            const fileInfo = await checkRes.json();
            sha = fileInfo.sha;
          }

          // Create or update file
          const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "XUI-Admin",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `feat(registry): publish component ${cleanId}`,
              content: Buffer.from(fileContent).toString("base64"),
              ...(sha ? { sha } : {}),
            }),
          });

          if (!putRes.ok) {
            const errBody = await putRes.text();
            throw new Error(`GitHub PUT ${filePath} failed (${putRes.status}): ${errBody}`);
          }
        };

        await commitFileToGitHub(`components/${cleanId}/index.tsx`, code);
        await commitFileToGitHub(`components/${cleanId}/index.jsx`, finalJsCode);
        await commitFileToGitHub(
          `components/${cleanId}/meta.json`,
          JSON.stringify(metaData, null, 2)
        );
        // Commit registry.json: if local registry had <= 1 items (e.g. serverless read-only), merge with GitHub remote items
        let remoteMergedRegistry = registryIndex;
        if (registryIndex.items.length <= 1) {
          try {
            const regCheck = await fetch(
              `https://api.github.com/repos/${repoOwner}/${repoName}/contents/registry.json`,
              {
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: "application/vnd.github.v3+json",
                  "User-Agent": "XUI-Admin",
                },
              }
            );
            if (regCheck.ok) {
              const regInfo = await regCheck.json();
              if (regInfo.content) {
                const parsed = JSON.parse(Buffer.from(regInfo.content, "base64").toString("utf-8"));
                if (parsed && Array.isArray(parsed.items)) {
                  const idx = parsed.items.findIndex((item: any) => item.name === cleanId);
                  if (idx >= 0) {
                    parsed.items[idx] = metaData;
                  } else {
                    parsed.items.push(metaData);
                  }
                  remoteMergedRegistry = parsed;
                }
              }
            }
          } catch {}
        }

        await commitFileToGitHub(
          `registry.json`,
          JSON.stringify(remoteMergedRegistry, null, 2)
        );

        githubStatus = `Committed & published to github.com/${repoOwner}/${repoName}`;
        githubSynced = true;
      } catch (err: any) {
        console.error("GitHub API commit error:", err);
        githubError = err?.message || "Failed to commit to GitHub repository";
        githubStatus = `Local save succeeded; GitHub API commit failed: ${githubError}`;
        githubSynced = false;
      }
    }

    // 5. On-Demand Revalidation: Refresh cache immediately upon uploading
    try {
      const { revalidateTag, revalidatePath } = await import("next/cache");
      revalidateTag("components-registry", { expire: 0 });
      revalidateTag(`component-${cleanId}`, { expire: 0 });
      revalidatePath("/components");
      revalidatePath(`/components/${cleanId}`);
      revalidatePath("/api/registry");
      revalidatePath(`/api/registry/${cleanId}`);
    } catch (revalErr) {
      console.warn("On-demand revalidation notice:", revalErr);
    }

    if (githubToken && !githubSynced) {
      return NextResponse.json(
        {
          success: false,
          partial: true,
          githubSynced: false,
          id: cleanId,
          githubStatus,
          message: `Saved locally, but failed to sync to GitHub: ${githubError}`,
          cliCommand: `npx xui add ${cleanId}`,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({
      success: true,
      partial: false,
      githubSynced: true,
      id: cleanId,
      githubStatus,
      message: `Component '${cleanId}' published successfully!`,
      cliCommand: `npx xui add ${cleanId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
