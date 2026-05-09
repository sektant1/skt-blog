export async function triggerVercelDeployHook(): Promise<void> {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHookUrl) {
    return;
  }

  try {
    const response = await fetch(deployHookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (!response.ok) {
      console.warn(
        `Vercel deploy hook returned ${response.status} ${response.statusText}.`,
      );
    }
  } catch (error) {
    console.warn(
      "Vercel deploy hook failed:",
      error instanceof Error ? error.message : error,
    );
  }
}
