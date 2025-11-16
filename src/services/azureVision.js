const VISION_ENDPOINT =
  import.meta.env.VITE_AZURE_VISION_ENDPOINT?.replace(/\/$/, "") || "";
const VISION_KEY = import.meta.env.VITE_AZURE_VISION_KEY || "";
const VISION_API_VERSION =
  import.meta.env.VITE_AZURE_VISION_API_VERSION || "2024-02-01";
const POLL_INTERVAL = 1000;
const MAX_POLL_ATTEMPTS = 15;

const buildAnalyzeUrl = () => {
  if (!VISION_ENDPOINT) {
    throw new Error("Azure Vision endpoint is not configured.");
  }
  // Use the Computer Vision Read API (async) for higher fidelity text extraction
  return `${VISION_ENDPOINT}/vision/v3.2/read/analyze`;
};

const normalizeContentType = (file) => {
  if (file?.type) {
    return file.type;
  }
  return "application/octet-stream";
};

const extractLines = (payload) => {
  const readResults =
    payload?.analyzeResult?.readResults ||
    payload?.readResult?.pages ||
    payload?.readResults ||
    [];

  const lines = [];
  readResults.forEach((page) => {
    (page?.lines || []).forEach((line) => {
      const content = line?.text || line?.content;
      if (content) {
        lines.push(content.trim());
      }
    });
  });

  return lines.join("\n");
};

const pollForResult = async (operationLocation) => {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

    const statusResponse = await fetch(operationLocation, {
      headers: {
        "Ocp-Apim-Subscription-Key": VISION_KEY,
      },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      throw new Error(
        `Azure Vision status check failed (${statusResponse.status}): ${errorText}`
      );
    }

    const payload = await statusResponse.json();
    const status = payload?.status?.toLowerCase();

    if (status === "succeeded") {
      return payload;
    }

    if (status === "failed") {
      throw new Error("Azure Vision read operation failed.");
    }
  }

  throw new Error("Azure Vision read operation timed out.");
};

export const extractTextWithAzureVision = async (file) => {
  if (!VISION_ENDPOINT || !VISION_KEY) {
    console.warn("Azure Vision environment variables are missing.");
    return "";
  }

  const analyzeUrl = buildAnalyzeUrl();
  const arrayBuffer = await file.arrayBuffer();

  const response = await fetch(analyzeUrl, {
    method: "POST",
    headers: {
      "Content-Type": normalizeContentType(file),
      "Ocp-Apim-Subscription-Key": VISION_KEY,
    },
    body: arrayBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Azure Vision request failed (${response.status}): ${errorText}`
    );
  }

  const operationLocation = response.headers.get("operation-location");
  if (!operationLocation) {
    throw new Error(
      "Azure Vision did not return an operation-location header."
    );
  }

  const payload = await pollForResult(operationLocation);
  return extractLines(payload);
};
