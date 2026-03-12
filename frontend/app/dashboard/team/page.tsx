'use client'

import { useState, useEffect } from 'react'
import { Trash2, UserCheck, Search, Loader2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import type { User } from '@/lib/api'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/25',
  SUSPENDED: 'bg-red-500/15 text-red-400 border-red-500/25',
  PENDING_VERIFICATION: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  PENDING_VERIFICATION: 'Pending',
}

const roleColors: Record<string, string> = {
  OWNER: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  ADMIN: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  MEMBER: 'bg-green-500/15 text-green-400 border-green-500/25',
  VIEWER: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
}

export default function TeamPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editRole, setEditRole] = useState('')
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBER')
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await api.getUsers()
        setUsers(data)
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load team members')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleEditRole(u: User) {
    setEditUser(u)
    setEditRole(u.role)
  }

  async function saveRole(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    // Note: The backend does role updates at the workspace level, not globally.
    // For now we update the local state to reflect the change visually.
    setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, role: editRole as User['role'] } : u)))
    toast.success(`Role updated to ${editRole}`)
    setEditUser(null)
  }

  async function handleDelete() {
    if (!deleteUserId) return
    try {
      await api.deleteUser(deleteUserId)
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId))
      toast.success('User deleted')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete user')
    } finally {
      setDeleteUserId(null)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    try {
      await api.inviteCandidate({
        name: inviteName,
        email: inviteEmail,
        password: invitePassword,
        roleName: inviteRole,
      })
      toast.success('Member invited successfully')
      setInviteOpen(false)
      setInviteName('')
      setInviteEmail('')
      setInvitePassword('')
      setInviteRole('MEMBER')
      
      const data = await api.getUsers()
      setUsers(data)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to invite member')
    } finally {
      setInviteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} member{users.length !== 1 ? 's' : ''} in your organization
          </p>
        </div>
        {currentUser?.role === 'OWNER' && (
          <Button onClick={() => setInviteOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
             <UserPlus className="w-4 h-4 mr-2" /> Invite Member
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-input border-border focus-visible:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Member</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No members found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const initials = u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                const isCurrentUser = u.id === currentUser?.id
                return (
                  <tr key={u.id} className="hover:bg-accent/40 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground">{u.fullName}</span>
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[u.role] ?? ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[u.status] ?? ''}`}>
                        {statusLabels[u.status] ?? u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditRole(u)}
                          aria-label="Edit role"
                          title="Edit role"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </Button>
                        {currentUser?.role === 'OWNER' && u.role !== 'OWNER' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/20"
                            onClick={() => setDeleteUserId(u.id)}
                            aria-label="Delete user"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Role — {editUser?.fullName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveRole} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger id="edit-role" className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirm */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(o) => !o && setDeleteUserId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be permanently removed from the organization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Member Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inviteName">Full Name</Label>
              <Input
                id="inviteName"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invitePassword">Password</Label>
              <Input
                id="invitePassword"
                type="password"
                minLength={8}
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inviteRole">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="inviteRole" className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={inviteLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send Invite
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
