const API_URL = process.env.REACT_APP_API_URL || "https://3dc7-2401-4900-1c09-829d-f932-da7e-10f1-ba7c.ngrok-free.app";
const NGROK_HEADERS = API_URL.includes(".ngrok-free.app")
  ? { "ngrok-skip-browser-warning": "true" }
  : {};

const request = async (path, options = {}) => {
  const { token, ...fetchOptions } = options;
  const headers = {
    ...NGROK_HEADERS,
    ...(fetchOptions.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return Object.prototype.hasOwnProperty.call(data, "data") ? data.data : data;
};

const uploadFile = async (file) => {
  if (!file) {
    throw new Error("File required");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/chat/upload`, {
    method: "POST",
    headers: NGROK_HEADERS,
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    const errors = data.errors || data.missing || data.details;
    const details = errors
      ? ` (${Array.isArray(errors) ? errors.join(", ") : errors})`
      : "";

    throw new Error(`${data.message || data.error || "File upload failed"}${details}`);
  }

  return (data.data || data).fileUrl;
};

export { API_URL, NGROK_HEADERS, request, uploadFile };
