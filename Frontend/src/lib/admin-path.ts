export const ADMIN_PATH = "admin";

export function adminRoute(path = ""): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return normalizedPath ? `/${ADMIN_PATH}/${normalizedPath}` : `/${ADMIN_PATH}`;
}
