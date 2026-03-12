'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, Camera, Building2, User, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const router = useRouter()
  const { user, company, setUser, setCompany, logout } = useAuthStore()

  // Company form
  const [companyName, setCompanyName] = useState(company?.name ?? '')
  const [companyDesc, setCompanyDesc] = useState(company?.description ?? '')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [savingCompany, setSavingCompany] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  // Danger
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
  }

  async function saveCompany(e: React.FormEvent) {
    e.preventDefault()
    if (!company?.id) {
      // If we don't have a company ID yet, just update local state
      setCompany({ id: '', name: companyName, description: companyDesc })
      toast.success('Company settings saved')
      return
    }
    setSavingCompany(true)
    try {
      const updated = await api.updateCompany(company.id, {
        name: companyName,
        description: companyDesc,
      })
      setCompany(updated)
      toast.success('Company settings saved')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save company settings')
    } finally {
      setSavingCompany(false)
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await api.updateMe({ fullName })
      setUser(updated)
      toast.success('Profile updated')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleDeleteCompany() {
    if (!company?.id) {
      logout()
      router.push('/login')
      return
    }
    try {
      await api.deleteCompany(company.id)
      logout()
      toast.success('Company account deleted')
      router.push('/login')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete company')
    }
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your company and profile preferences
        </p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="company" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-foreground">
            <Building2 className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-foreground">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-foreground text-destructive-foreground">
            <ShieldAlert className="w-4 h-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="mt-5">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-5">Company Settings</h2>
            <form onSubmit={saveCompany} className="flex flex-col gap-5">
              {/* Logo */}
              <div className="flex flex-col gap-1.5">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoPreview} alt="Company logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-card flex items-center justify-center hover:bg-primary/90 transition-colors"
                      aria-label="Upload logo"
                    >
                      <Camera className="w-3 h-3 text-primary-foreground" />
                    </button>
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleLogoChange}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border"
                    onClick={() => logoRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-input border-border focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-desc">Description</Label>
                <Textarea
                  id="company-desc"
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  className="bg-input border-border focus-visible:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={savingCompany}
                >
                  {savingCompany ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-5">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-5">Profile Settings</h2>
            <form onSubmit={saveProfile} className="flex flex-col gap-5">
              {/* Avatar */}
              <div className="flex flex-col gap-1.5">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border border-border">
                      {avatarPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => avatarRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-card flex items-center justify-center hover:bg-primary/90 transition-colors"
                      aria-label="Upload avatar"
                    >
                      <Camera className="w-3 h-3 text-primary-foreground" />
                    </button>
                    <input
                      ref={avatarRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border"
                    onClick={() => avatarRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Avatar
                  </Button>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-input border-border focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input
                  value={user?.email ?? ''}
                  className="bg-input border-border text-muted-foreground"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Input
                  value={user?.role ?? ''}
                  className="bg-input border-border text-muted-foreground"
                  disabled
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="mt-5">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Actions here are irreversible. Please proceed with extreme caution.
            </p>
            <Separator className="bg-destructive/20 mb-5" />
            <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Delete Company Account</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will permanently delete your company, all workspaces, documents, and team data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="flex-shrink-0"
                onClick={() => setDeleteOpen(true)}
              >
                Delete Company
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Company Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{company?.name}</strong> and all associated data including workspaces, documents, and team members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
