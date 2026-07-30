import { afterEach, describe, expect, it, vi } from "vitest";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function loadClient(responses: Response[]) {
  vi.resetModules();
  const fetchMock = vi.fn(async () => {
    const response = responses.shift();
    if (!response) throw new Error("Unexpected fetch");
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  const client = await import("./api.client");
  return { ...client, fetchMock };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

describe("apiRequest", () => {
  it("serializes query parameters and ignores undefined values", async () => {
    const { apiRequest, fetchMock } = await loadClient([jsonResponse({ ok: true })]);

    await apiRequest("/products", {
      params: { page: 2, active: true, missing: undefined },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/products?page=2&active=true`,
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("serializes JSON bodies and obtains a CSRF token for mutations", async () => {
    const { apiRequest, fetchMock } = await loadClient([
      jsonResponse({ token: "csrf-token" }),
      jsonResponse({ id: 7 }),
    ]);

    await expect(apiRequest("/products", { method: "POST", body: { name: "Watch" } }))
      .resolves.toEqual({ id: 7 });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/products`,
      expect.objectContaining({
        body: JSON.stringify({ name: "Watch" }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-CSRF-Token": "csrf-token",
        }),
      }),
    );
  });

  it("does not set a JSON content type for FormData", async () => {
    const formData = new FormData();
    formData.append("name", "Watch");
    const { apiRequest, fetchMock } = await loadClient([
      jsonResponse({ token: "csrf-token" }),
      jsonResponse({ ok: true }),
    ]);

    await apiRequest("/uploads", { method: "POST", body: formData });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/uploads`,
      expect.objectContaining({
        body: formData,
        headers: { "X-CSRF-Token": "csrf-token" },
      }),
    );
  });

  it("throws an ApiClientError with the server message", async () => {
    const { apiRequest } = await loadClient([
      jsonResponse({ message: "Invalid bid" }, 400),
    ]);

    await expect(apiRequest("/bids")).rejects.toEqual(
      expect.objectContaining({ status: 400, message: "Invalid bid" }),
    );
  });

  it("refreshes the CSRF token once after an invalid-token response", async () => {
    const { apiRequest, fetchMock } = await loadClient([
      jsonResponse({ token: "old-token" }),
      jsonResponse({ message: "Invalid CSRF token" }, 403),
      jsonResponse({ token: "new-token" }),
      jsonResponse({ ok: true }),
    ]);

    await expect(apiRequest("/bids", { method: "POST", body: { amount: "100" } }))
      .resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      `${baseUrl}/bids`,
      expect.objectContaining({
        headers: expect.objectContaining({ "X-CSRF-Token": "new-token" }),
      }),
    );
  });

  it("refreshes the session and replays a request after a 401", async () => {
    const { apiRequest, fetchMock } = await loadClient([
      jsonResponse({ message: "Unauthorized" }, 401),
      jsonResponse({ token: "csrf-token" }),
      jsonResponse({ ok: true }),
      jsonResponse({ products: [] }),
    ]);

    await expect(apiRequest("/products/private")).resolves.toEqual({ products: [] });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${baseUrl}/accounts/sessions/refresh`,
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      `${baseUrl}/products/private`,
      expect.any(Object),
    );
  });
});
