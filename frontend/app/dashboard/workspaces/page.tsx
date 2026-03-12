'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  FolderOpen,
  Users,
  FileText,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { formatDate } from '@/lib/mock-data'
import api from '@/lib/api'
import type { Workspace } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'

export default function WorkspacesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editWorkspace, setEditWorkspace] = useState<Workspace | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const ws = await api.getWorkspaces()
        setWorkspaces(ws)
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load workspaces')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkspaces()
  }, [])

  function openCreate() {
    setName('')
    setDescription('')
    setCreateOpen(true)
  }

  function openEdit(ws: Workspace) {
    setEditWorkspace(ws)
    setName(ws.name)
    setDescription(ws.description)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const newWs = await api.createWorkspace({ name: name.trim(), description: description.trim() })
      setWorkspaces((prev) => [newWs, ...prev])
      toast.success(`Workspace "${name}" created`)
      setCreateOpen(false)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create workspace')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editWorkspace) return
    setSaving(true)
    try {
      const updated = await api.updateWorkspace(editWorkspace.id, {
        name: name.trim(),
        description: description.trim(),
      })
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === editWorkspace.id ? updated : w))
      )
      toast.success('Workspace updated')
      setEditWorkspace(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update workspace')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await api.deleteWorkspace(deleteId)
      setWorkspaces((prev) => prev.filter((w) => w.id !== deleteId))
      toast.success('Workspace deleted')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete workspace')
    } finally {
      setDeleteId(null)
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
          <h1 className="text-2xl font-semibold text-foreground">Workspaces</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
          </p>
        </div>
        {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
          <Button
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </Button>
        )}
      </div>

      {/* Grid */}
      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted border border-border">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">No workspaces yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first workspace to get started
            </p>
          </div>
          {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4" />
              Create Workspace
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="relative group rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-200 overflow-hidden"
            >
              {/* Top accent line */}
              <div className="h-0.5 bg-primary/30 group-hover:bg-primary transition-all duration-200" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  {/* 3-dot menu */}
                  {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Workspace options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(ws)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(ws.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <Link href={`/dashboard/workspaces/${ws.id}`} className="block">
                  <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    {ws.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {ws.description}
                  </p>
                </Link>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {ws.memberCount} member{ws.memberCount !== 1 ? 's' : ''}
                  </span>
                  {ws.createdAt && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ws.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                placeholder="e.g. Product Research"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea
                id="create-desc"
                placeholder="What is this workspace for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={saving}
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editWorkspace} onOpenChange={(o) => !o && setEditWorkspace(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditWorkspace(null)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={saving}
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace and all its documents. This action cannot be undone.
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
    </div>
  )
}
