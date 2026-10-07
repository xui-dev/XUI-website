import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    // 1. Verify localhost access
    const host = request.headers.get("host") || "";
    const isLocalhost =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("::1") ||
      process.env.NODE_ENV === "development";

    if (!isLocalhost) {
      return NextResponse.json(
        { error: "Forbidden: Admin actions are restricted to localhost only." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Component ID is required for deletion." },
        { status: 400 }
      );
    }

    const cleanId = id.trim().toLowerCase();
    const registryDir = path.join(process.cwd(), "registry");
    const componentDir = path.join(registryDir, "components", cleanId);
    const registryJsonPath = path.join(registryDir, "registry.json");

    // 2. Delete local component folder & update local registry.json (Serverless-safe)
    let localRegistryData: string | null = null;
    try {
      await fs.rm(componentDir, { recursive: true, force: true });

      const existingData = await fs.readFile(registryJsonPath, "utf-8");
      const registryIndex = JSON.parse(existingData);

      registryIndex.items = (registryIndex.items || []).filter(
        (item: any) => item.name !== cleanId
      );

      localRegistryData = JSON.stringify(registryIndex, null, 2);
      await fs.writeFile(
        registryJsonPath,
        localRegistryData,
        "utf-8"
      );
    } catch (fsErr: any) {
      // In serverless environments, local filesystem is read-only; continue to remote GitHub sync
      console.warn("Local filesystem delete skipped/failed (expected in serverless environments):", fsErr?.message);
    }

    // 4. If GitHub token is present, attempt remote deletion or update
    let githubStatus = "Deleted locally from registry";
    let githubSynced = false;
    let githubError: string | null = null;
    const githubToken = process.env.GITHUB_TOKEN;

    if (githubToken) {
      try {
        const repoOwner = "xui-dev";
        const repoName = "XUI-components-";

        // Helper to get sha of a file
        const getFileSha = async (filePath: string) => {
          const res = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "XUI-Admin",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            return data.sha;
          }
          return null;
        };

        // 1. Fetch and delete all files inside components/${cleanId} directory
        const folderUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/components/${cleanId}`;
        const folderRes = await fetch(folderUrl, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "XUI-Admin",
          },
        });

        if (folderRes.ok) {
          const files = await folderRes.json();
          if (Array.isArray(files)) {
            for (const file of files) {
              if (file.sha && file.path) {
                const delRes = await fetch(
                  `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file.path}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${githubToken}`,
                      Accept: "application/vnd.github.v3+json",
                      "User-Agent": "XUI-Admin",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      message: `delete: remove ${file.path} for component ${cleanId}`,
                      sha: file.sha,
                    }),
                  }
                );
                if (!delRes.ok && delRes.status !== 404) {
                  const errTxt = await delRes.text();
                  console.warn(`Failed to delete ${file.path}: ${errTxt}`);
                }
              }
            }
          }
        }

        // Update registry.json on GitHub
        const regSha = await getFileSha("registry.json");
        if (regSha) {
          let registryData = localRegistryData;
          if (!registryData) {
            try {
              const regRes = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/registry.json`,
                {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "XUI-Admin",
                  },
                }
              );
              if (regRes.ok) {
                const regInfo = await regRes.json();
                if (regInfo.content) {
                  const parsed = JSON.parse(
                    Buffer.from(regInfo.content, "base64").toString("utf-8")
                  );
                  parsed.items = (parsed.items || []).filter(
                    (item: any) => item.name !== cleanId
                  );
                  registryData = JSON.stringify(parsed, null, 2);
                }
              }
            } catch {}
          }

          if (registryData) {
            const putRegRes = await fetch(
              `https://api.github.com/repos/${repoOwner}/${repoName}/contents/registry.json`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: "application/vnd.github.v3+json",
                  "User-Agent": "XUI-Admin",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  message: `chore: update registry catalog after deleting ${cleanId}`,
                  content: Buffer.from(registryData).toString("base64"),
                  sha: regSha,
                }),
              }
            );
            if (!putRegRes.ok) {
              const errTxt = await putRegRes.text();
              throw new Error(`GitHub PUT registry.json failed (${putRegRes.status}): ${errTxt}`);
            }
          }
        }

        githubStatus = `Deleted locally and synchronized to github.com/${repoOwner}/${repoName}`;
        githubSynced = true;
      } catch (ghErr: any) {
        console.warn("GitHub remote sync error:", ghErr);
        githubError = ghErr?.message || "Failed to remove component from GitHub repository";
        githubStatus = `Deleted locally; GitHub API removal failed: ${githubError}`;
        githubSynced = false;
      }
    }

    // 5. On-Demand Revalidation: Expire cache on delete immediately
    try {
      const { revalidateTag, revalidatePath } = await import("next/cache");
      revalidateTag("components-registry", { expire: 0 });
      revalidateTag(`component-${cleanId}`, { expire: 0 });
      revalidatePath("/components");
      revalidatePath(`/components/${cleanId}`);
      revalidatePath("/api/registry");
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
          message: `Deleted locally, but failed to sync deletion to GitHub: ${githubError}`,
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
      message: `Component '${cleanId}' has been deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error deleting component" },
      { status: 500 }
    );
  }
}
