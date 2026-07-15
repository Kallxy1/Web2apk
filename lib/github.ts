interface DispatchInput { [key: string]: string }
export async function dispatchBuild(inputs:DispatchInput,workflow="build-apk.yml") {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) throw new Error("Konfigurasi GitHub belum lengkap");
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: process.env.GITHUB_REF || "main", inputs }),
    }
  );
  if (!response.ok) throw new Error(`GitHub dispatch gagal (${response.status}): ${await response.text()}`);
}
