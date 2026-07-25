export interface EnvCheckResult {
  envName: string;
  isSet: boolean;
}

export async function checkEnvVar(envName: string): Promise<EnvCheckResult> {
  try {
    const response = await fetch(`/api/env?envName=${encodeURIComponent(envName)}`);
    if (!response.ok) {
      return { envName, isSet: false };
    }
    const data = (await response.json()) as EnvCheckResult;
    return { envName, isSet: data.isSet ?? false };
  } catch {
    return { envName, isSet: false };
  }
}
