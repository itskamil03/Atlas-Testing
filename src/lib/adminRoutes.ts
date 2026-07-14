export function getAdminRoute(tab: string = "overview") {
  return `/dashboard/admin?tab=${tab}`;
}

export function setAdminViewMode() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("viewMode", "admin");
  }
}
