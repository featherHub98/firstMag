import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { listRoles, updateRolePermissions } from "../../api/userApi";
import { useToastStore } from "../../api/toastStore";
import type { AppRole } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PERMISSIONS = [
  "dashboard",
  "pos",
  "sales",
  "stock",
  "articles",
  "partners",
  "reports",
  "settings",
];

export default function RolePermissionManagement() {
  const [roles, setRoles] = React.useState<AppRole[]>([]);
  const [savingRole, setSavingRole] = React.useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setRoles(await listRoles());
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  function toggle(roleId: string, permission: string, checked: boolean) {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const perms = new Set(role.permissions);
        if (checked) perms.add(permission);
        else perms.delete(permission);
        return { ...role, permissions: Array.from(perms) };
      }),
    );
  }

  async function save(role: AppRole) {
    setSavingRole(role.id);
    try {
      await updateRolePermissions({ role_id: role.id, permissions: role.permissions });
      addToast(`Permissions mises a jour: ${role.name}`, "success");
    } catch (e) {
      addToast(String(e), "error");
    } finally {
      setSavingRole(null);
    }
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => {
        const wildcard = role.permissions.includes("*");
        return (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                {role.name}
              </CardTitle>
              <CardDescription>{role.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wildcard ? (
                <p className="text-sm text-muted-foreground">Acces total (toutes permissions).</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PERMISSIONS.map((perm) => {
                    const id = `${role.id}_${perm}`;
                    return (
                      <div key={perm} className="flex items-center space-x-2">
                        <Checkbox
                          id={id}
                          checked={role.permissions.includes(perm)}
                          onCheckedChange={(checked) => toggle(role.id, perm, Boolean(checked))}
                        />
                        <Label htmlFor={id} className="text-sm capitalize">
                          {perm}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => void save(role)} disabled={savingRole === role.id || wildcard}>
                  {savingRole === role.id ? "Enregistrement..." : "Enregistrer permissions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
