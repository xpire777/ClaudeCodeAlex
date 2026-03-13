const COMFY_DEPLOY_API_KEY = process.env.COMFY_DEPLOY_API_KEY!;
const COMFY_DEPLOY_BASE_URL = "https://api.comfydeploy.com/api";

// Map persona slugs to their ComfyDeploy deployment IDs
export const PERSONA_DEPLOYMENTS: Record<string, string> = {
  valentina: "476efb12-ce8e-4e81-8574-1e4a1b08a637",
};

// Trigger words used during LoRA training
export const PERSONA_TRIGGER_WORDS: Record<string, string> = {
  valentina: "VALENTINA",
};

export async function queueComfyRun(deploymentId: string, prompt: string) {
  const res = await fetch(`${COMFY_DEPLOY_BASE_URL}/run/deployment/queue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${COMFY_DEPLOY_API_KEY}`,
    },
    body: JSON.stringify({
      deployment_id: deploymentId,
      inputs: { prompt },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ComfyDeploy queue failed: ${res.status} ${err}`);
  }

  return res.json() as Promise<{ run_id: string }>;
}

export async function getComfyRunStatus(runId: string) {
  const res = await fetch(`${COMFY_DEPLOY_BASE_URL}/run/${runId}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${COMFY_DEPLOY_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`ComfyDeploy status check failed: ${res.status}`);
  }

  return res.json() as Promise<{
    status: string;
    outputs?: Array<{ data?: { images?: Array<{ url: string }> } }>;
  }>;
}
