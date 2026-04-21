import { useAuth } from "./useAuth";

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 4,
  consejo: 3,
  vigilancia: 2,
  residente: 1,
};

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: string) => user?.role === role;

  const hasMinRole = (minRole: string) => {
    if (!user) return false;
    return (ROLE_HIERARCHY[user.role] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
  };

  const hasAnyRole = (roles: string[]) => user?.role in roles;

  return { hasRole, hasMinRole, hasAnyRole };
}
