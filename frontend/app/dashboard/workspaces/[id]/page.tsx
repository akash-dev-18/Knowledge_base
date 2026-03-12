'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileText,
  Users,
  Trash2,
  MessageSquare,
  ArrowLeft,
  CloudUpload,
  Plus,
  Loader2,
  UserMinus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate, formatFileSize } from '@/lib/mock-data'
import api from '@/lib/api'
import type { Workspace, Document, WorkspaceMember } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

const statusColors: Record<string, string> = {
  INDEXED: 'bg-green-500/15 text-green-400 border-green-500/25',
  READY: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  UPLOADING: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  FAILED: 'bg-red-500/15 text-red-400 border-red-500/25',
}

const roleColors: Record<string, string> = {
  OWNER: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  ADMIN: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  MEMBER: 'bg-green-500/15 text-green-400 border-green-500/25',
  VIEWER: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
}

export default function WorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)

  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberPassword, setNewMemberPassword] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('MEMBER')
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)

  const companyRole = user?.role
  const myWorkspaceRole = members.find((m) => m.userId === user?.id)?.role
  
  const canUpload = companyRole === 'OWNER' || companyRole === 'ADMIN' || myWorkspaceRole === 'OWNER' || myWorkspaceRole === 'ADMIN' || myWorkspaceRole === 'MEMBER'
  const canManageMembers = companyRole === 'OWNER' || companyRole === 'ADMIN' || myWorkspaceRole === 'OWNER' || myWorkspaceRole === 'ADMIN'
  const canDeleteDoc = companyRole === 'OWNER' || companyRole === 'ADMIN' || myWorkspaceRole === 'OWNER' || myWorkspaceRole === 'ADMIN'

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      try {
        const [ws, docs, mems] = await Promise.all([
          api.getWorkspace(id),
          api.getDocuments(id),
          api.getWorkspaceMembers(id),
        ])
        setWorkspace(ws)
        setDocuments(docs)
        setMembers(mems)
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load workspace')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0 || !id) return
    const file = files[0]

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB')
      return
    }

    // Validate type
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      toast.error('Only PDF and TXT files allowed')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Show progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 300)

    try {
      const newDoc = await api.uploadDocument(file, id)
      clearInterval(progressInterval)
      setUploadProgress(100)
      setDocuments((prev) => [newDoc, ...prev])
      toast.success(`${file.name} uploaded successfully`)
    } catch (err: any) {
      clearInterval(progressInterval)
      toast.error(err?.message || 'Upload failed')
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!newMemberEmail.trim() || !id) return
    setAddMemberLoading(true)
    try {
      let targetUserId = ''

      try {
        // Attempt to invite them into the company first
        const invitedUser = await api.inviteCandidate({
          name: newMemberName,
          email: newMemberEmail,
          password: newMemberPassword,
          roleName: newMemberRole,
        })
        targetUserId = invitedUser.id
      } catch (err: any) {
        // If they already exist, we silently snag their UUID from the system instead
        if (err.message?.toLowerCase().includes('already exists')) {
          const allUsers = await api.getUsers()
          const existing = allUsers.find(u => u.email.toLowerCase() === newMemberEmail.toLowerCase())
          if (!existing) throw new Error('User exists but could not be resolved')
          targetUserId = existing.id
        } else {
          throw err
        }
      }

      // Finally link the UUID into the workspace
      const member = await api.addWorkspaceMember(id, {
        userId: targetUserId,
        role: newMemberRole,
      })
      
      setMembers((prev) => [...prev, member])
      toast.success('Member assigned to workspace')
      setAddMemberOpen(false)
      setNewMemberName('')
      setNewMemberEmail('')
      setNewMemberPassword('')
      setNewMemberRole('MEMBER')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add member')
    } finally {
      setAddMemberLoading(false)
    }
  }

  async function handleDeleteDoc() {
    if (!deleteDocId) return
    try {
      await api.deleteDocument(deleteDocId)
      setDocuments((prev) => prev.filter((d) => d.id !== deleteDocId))
      toast.success('Document deleted')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete document')
    } finally {
      setDeleteDocId(null)
    }
  }

  async function handleRemoveMember() {
    if (!removeMemberId || !id) return
    try {
      await api.removeWorkspaceMember(id, removeMemberId)
      setMembers((prev) => prev.filter((m) => m.userId !== removeMemberId))
      toast.success('Member removed')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove member')
    } finally {
      setRemoveMemberId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">Workspace not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/workspaces')}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/workspaces')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Workspaces
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{workspace.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{workspace.description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> {members.length} members
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> {documents.length} documents
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="documents">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-foreground">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-foreground">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4">
          {/* Upload zone */}
          {canUpload && (
            <div
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 mb-5 transition-all duration-200 cursor-pointer',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/30'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept=".pdf,.txt"
              />
              <CloudUpload
                className={cn(
                  'w-8 h-8 mb-3 transition-colors',
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <p className="text-sm font-medium text-foreground">
                {isDragging ? 'Drop to upload' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse · PDF, TXT
              </p>
              {uploading && (
                <div className="w-48 mt-4">
                  <Progress value={uploadProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-center mt-1.5">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Documents table */}
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 gap-3">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No documents yet. Upload your first document above.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">File Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Size</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">By</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-accent/40 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatFileSize(doc.size)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[doc.status] ?? ''}`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.uploadedBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/workspaces/${id}/documents/${doc.id}/chat`}
                            className={cn(
                              'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors',
                              doc.status === 'READY' || doc.status === 'INDEXED'
                                ? 'border-primary/30 text-primary hover:bg-primary/10'
                                : 'border-border text-muted-foreground cursor-not-allowed pointer-events-none opacity-50'
                            )}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Chat
                          </Link>
                          {canDeleteDoc && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/20"
                              onClick={() => setDeleteDocId(doc.id)}
                              aria-label="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{members.length} members</p>
            {canManageMembers && (
              <Button
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setAddMemberOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Member
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => {
                  const initials = member.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={member.userId} className="hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{member.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[member.role] ?? ''}`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(member.joinedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {canManageMembers && member.role !== 'OWNER' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/20"
                              onClick={() => setRemoveMemberId(member.userId)}
                              aria-label="Remove member"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Modal */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="memberName">Full Name</Label>
              <Input
                id="memberName"
                placeholder="Alex Johnson"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="memberEmail">Email</Label>
              <Input
                id="memberEmail"
                type="email"
                placeholder="alex@company.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="memberPassword">Password (if new)</Label>
              <Input
                id="memberPassword"
                type="password"
                minLength={8}
                value={newMemberPassword}
                onChange={(e) => setNewMemberPassword(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger id="role" className="bg-input border-border">
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
              <Button type="button" variant="outline" onClick={() => setAddMemberOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button type="submit" disabled={addMemberLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {addMemberLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Member
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Doc Confirm */}
      <AlertDialog open={!!deleteDocId} onOpenChange={(o) => !o && setDeleteDocId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              This document and all its chat history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoc} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirm */}
      <AlertDialog open={!!removeMemberId} onOpenChange={(o) => !o && setRemoveMemberId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              This member will lose access to the workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
