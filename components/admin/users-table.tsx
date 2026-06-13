"use client";

import { useState, useOptimistic } from "react";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { updateUserAccessAction } from "@/app/actions/admin";
import { SendNotificationDialog } from "@/components/send-notification-dialog";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import type { User } from "@/generated/prisma";

export function UsersTable({ users }: { users: User[] }) {
  const [query, setQuery] = useState("");

  const [optimisticUsers, setOptimisticUser] = useOptimistic(
    users,
    (state, updatedUser: { id: string; role: any; active: boolean }) =>
      state.map((u) => (u.id === updatedUser.id ? { ...u, role: updatedUser.role, active: updatedUser.active } : u))
  );

  const filteredUsers = optimisticUsers.filter((u) => {
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q))
    );
  });

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Department", "Employee ID", "Active", "Joined Date"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.role,
      `"${u.department || ""}"`,
      u.employeeId || "",
      u.active,
      new Date(u.createdAt).toISOString().split('T')[0],
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `darion-users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or ID..."
            className="pl-9 bg-muted/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={downloadCSV} className="shrink-0 gap-2">
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <div className="border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found matching "{query}".
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative grid size-9 shrink-0 place-items-center overflow-hidden bg-muted text-xs font-bold text-foreground">
                        <span className="absolute inset-0 flex items-center justify-center">{u.name.charAt(0)}</span>
                        {u.avatarUrl && (
                          <img 
                            src={u.avatarUrl} 
                            alt="" 
                            width={36} 
                            height={36} 
                            className="relative z-10 size-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{u.role}</Badge>
                  </TableCell>
                  <TableCell>{u.employeeId ?? "—"}</TableCell>
                  <TableCell>{u.department ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <form action={async (formData) => {
                        const newRole = formData.get("role");
                        const newActive = formData.get("active") === "true";
                        setOptimisticUser({ id: u.id, role: newRole, active: newActive });
                        try {
                          await updateUserAccessAction(formData);
                          toast.success("User access updated successfully");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to update user access");
                        }
                      }} className="flex min-w-64 items-end gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <div>
                          <Label className="sr-only">Role</Label>
                          <Select name="role" defaultValue={u.role}>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="INTERN">Intern</option>
                            <option value="MENTOR">Mentor</option>
                            <option value="ADMIN">Admin</option>
                          </Select>
                        </div>
                        <div>
                          <Label className="sr-only">Status</Label>
                          <Select name="active" defaultValue={String(u.active)}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </Select>
                        </div>
                        <SubmitButton size="sm" variant="outline" pendingText="Saving...">
                          Save
                        </SubmitButton>
                      </form>
                      <SendNotificationDialog userId={u.id} userName={u.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
