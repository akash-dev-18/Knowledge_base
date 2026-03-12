'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FolderOpen,
  FileText,
  Users,
  HardDrive,
  Plus,
  Upload,
  ChevronRight,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import StatCard from '@/components/stat-card'
import { useAuthStore } from '@/lib/store'
import { formatDate, formatFileSize } from '@/lib/mock-data'
import api from '@/lib/api'
import type { Workspace, Document } from '@/lib/api'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  INDEXED: 'bg-green-500/15 text-green-400 border-green-500/25',
  READY: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  UPLOADING: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  FAILED: 'bg-red-500/15 text-red-400 border-red-500/25',
}

export default function DashboardPage() {
  const { user, company } = useAuthStore()
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [wsName, setWsName] = useState('')
  const [wsDesc, setWsDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [teamCount, setTeamCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [ws, users] = await Promise.all([
          api.getWorkspaces(),
          api.getUsers(),
        ])
        setWorkspaces(ws)
        setTeamCount(users.length)

        // Fetch documents from each workspace
        const allDocs: Document[] = []
        for (const w of ws.slice(0, 5)) {
          try {
            const docs = await api.getDocuments(w.id)
            allDocs.push(...docs)
          } catch {
            // skip workspace if docs fail
          }
        }
        setDocuments(allDocs)
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const recentDocs = documents.slice(0, 5)
  const recentWorkspaces = workspaces.slice(0, 3)
  const totalStorage = documents.reduce((acc, d) => acc + d.size, 0)
  const storageFormatted = formatFileSize(totalStorage)

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!wsName.trim()) return
    setCreating(true)
    try {
      await api.createWorkspace({ name: wsName.trim(), description: wsDesc.trim() })
      toast.success(`Workspace "${wsName}" created`)
      setCreateOpen(false)
      setWsName('')
      setWsDesc('')
      router.push('/dashboard/workspaces')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create workspace')
    } finally {
      setCreating(false)
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
          <h1 className="text-2xl font-semibold text-foreground text-balance">
            Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {company?.name} · Here&apos;s your overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border hover:bg-accent"
            onClick={() => router.push('/dashboard/workspaces')}
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workspaces"
          value={workspaces.length}
          icon={FolderOpen}
          subtitle="Active workspaces"
        />
        <StatCard
          title="Total Documents"
          value={documents.length}
          icon={FileText}
          subtitle="Across all workspaces"
        />
        <StatCard
          title="Team Members"
          value={teamCount}
          icon={Users}
          subtitle="Active collaborators"
        />
        <StatCard
          title="Storage Used"
          value={storageFormatted}
          icon={HardDrive}
          subtitle="Of 10 GB limit"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Recent Documents</h2>
            </div>
            <Link
              href="/dashboard/workspaces"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentDocs.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No documents yet. Upload your first document in a workspace.
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border flex-shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {doc.uploadedAt ? formatDate(doc.uploadedAt) : '—'} · {formatFileSize(doc.size)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${statusColors[doc.status] ?? ''}`}
                  >
                    {doc.status}
                  </span>
                  <Link
                    href={`/dashboard/workspaces/${doc.workspaceId}/documents/${doc.id}/chat`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary hover:underline whitespace-nowrap"
                  >
                    Chat
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Workspaces */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Recent Workspaces</h2>
            </div>
            <Link
              href="/dashboard/workspaces"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {recentWorkspaces.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No workspaces yet. Create your first one!
              </div>
            ) : (
              recentWorkspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/dashboard/workspaces/${ws.id}`}
                  className="flex flex-col gap-2 px-5 py-4 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                      <FolderOpen className="w-4 h-4 text-primary" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ws.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {ws.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {ws.memberCount} members
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ws-name">Name</Label>
              <Input
                id="ws-name"
                placeholder="e.g. Product Research"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="bg-input border-border focus-visible:ring-primary"
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ws-desc">Description</Label>
              <Textarea
                id="ws-desc"
                placeholder="What is this workspace for?"
                value={wsDesc}
                onChange={(e) => setWsDesc(e.target.value)}
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
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
