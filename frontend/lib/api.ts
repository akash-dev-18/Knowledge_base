const SPRING_BASE = 'http://localhost:8080'
const FASTAPI_BASE = 'http://localhost:8000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

async function request<T>(
  base: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }

  const res = await fetch(`${base}${path}`, { ...options, headers })

  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(errorData?.message || `Request failed: ${res.status}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

// ─── Backend DTO types (match exactly what Spring Boot returns) ───

interface BackendAuthResponse {
  accessToken: string
  tokenType: string
  user: BackendUserResponse
}

interface BackendUserResponse {
  id: string
  name: string
  email: string
  status: string
  roleName: string
  companyName: string
}

interface BackendCompanyResponse {
  id: string
  name: string
  description: string
  logoUrl: string | null
}

interface BackendWorkspaceResponse {
  id: string
  name: string
  description: string
  companyName: string
  memberCount: number
}

interface BackendDocumentResponse {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  status: string
  workspaceName: string
  uploadedBy: string
}

interface BackendWorkspaceUserResponse {
  userId: string
  userName: string
  userEmail: string
  roleName: string
  joinedAt: string
}

// ─── Adapters: Backend → Frontend types ───

function adaptUser(u: BackendUserResponse): User {
  return {
    id: u.id,
    fullName: u.name,
    email: u.email,
    role: u.roleName as User['role'],
    status: u.status as User['status'],
    companyName: u.companyName,
  }
}

function adaptCompany(c: BackendCompanyResponse): Company {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? undefined,
    logoUrl: c.logoUrl ?? undefined,
  }
}

function adaptWorkspace(w: BackendWorkspaceResponse): Workspace {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    memberCount: w.memberCount,
    companyName: w.companyName,
    documentCount: 0,
    createdAt: '',
    ownerId: '',
  }
}

function adaptDocument(d: BackendDocumentResponse): Document {
  return {
    id: d.id,
    name: d.fileName,
    size: d.fileSize,
    status: d.status as Document['status'],
    uploadedAt: '',
    uploadedBy: d.uploadedBy,
    workspaceId: '',
    workspaceName: d.workspaceName,
  }
}

function adaptMember(m: BackendWorkspaceUserResponse): WorkspaceMember {
  return {
    userId: m.userId,
    fullName: m.userName,
    email: m.userEmail,
    role: m.roleName as WorkspaceMember['role'],
    joinedAt: m.joinedAt,
  }
}

// ─── API ───

const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await request<BackendAuthResponse>(SPRING_BASE, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, passwordHash: password }),
    })
    return {
      token: res.accessToken,
      user: adaptUser(res.user),
    }
  },

  register: async (data: {
    companyName: string
    companyDescription: string
    fullName: string
    email: string
    password: string
  }) => {
    const res = await request<BackendAuthResponse>(SPRING_BASE, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        companyName: data.companyName,
        name: data.fullName,
        email: data.email,
        password: data.password,
        description: data.companyDescription,
      }),
    })
    return {
      token: res.accessToken,
      user: adaptUser(res.user),
    }
  },

  inviteCandidate: async (data: {
    name: string
    email: string
    password: string
    roleName: string
  }) => {
    const res = await request<BackendAuthResponse>(SPRING_BASE, '/api/auth/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return adaptUser(res.user)
  },

  // Users
  getMe: async () => {
    const res = await request<BackendUserResponse>(SPRING_BASE, '/api/users/me')
    return adaptUser(res)
  },
  getUsers: async () => {
    const res = await request<BackendUserResponse[]>(SPRING_BASE, '/api/users')
    return res.map(adaptUser)
  },
  updateMe: async (data: { fullName?: string }) => {
    const backendData: Record<string, string> = {}
    if (data.fullName) backendData.name = data.fullName
    const res = await request<BackendUserResponse>(SPRING_BASE, '/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(backendData),
    })
    return adaptUser(res)
  },
  deleteUser: (id: string) =>
    request<void>(SPRING_BASE, `/api/users/${id}`, { method: 'DELETE' }),

  // Company
  getCompany: async (id: string) => {
    const res = await request<BackendCompanyResponse>(SPRING_BASE, `/api/companies/${id}`)
    return adaptCompany(res)
  },
  updateCompany: async (id: string, data: Partial<Company>) => {
    const res = await request<BackendCompanyResponse>(SPRING_BASE, `/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return adaptCompany(res)
  },
  deleteCompany: (id: string) =>
    request<void>(SPRING_BASE, `/api/companies/${id}`, { method: 'DELETE' }),

  // Workspaces
  getWorkspaces: async () => {
    const res = await request<BackendWorkspaceResponse[]>(SPRING_BASE, '/api/workspaces')
    return res.map(adaptWorkspace)
  },
  createWorkspace: async (data: { name: string; description: string }) => {
    const res = await request<BackendWorkspaceResponse>(SPRING_BASE, '/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return adaptWorkspace(res)
  },
  getWorkspace: async (id: string) => {
    const res = await request<BackendWorkspaceResponse>(SPRING_BASE, `/api/workspaces/${id}`)
    return adaptWorkspace(res)
  },
  updateWorkspace: async (id: string, data: Partial<Workspace>) => {
    const res = await request<BackendWorkspaceResponse>(SPRING_BASE, `/api/workspaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return adaptWorkspace(res)
  },
  deleteWorkspace: (id: string) =>
    request<void>(SPRING_BASE, `/api/workspaces/${id}`, { method: 'DELETE' }),

  // Workspace Members
  getWorkspaceMembers: async (id: string) => {
    const res = await request<BackendWorkspaceUserResponse[]>(
      SPRING_BASE,
      `/api/workspaces/${id}/members`
    )
    return res.map(adaptMember)
  },
  addWorkspaceMember: async (id: string, data: { userId: string; role: string }) => {
    const res = await request<BackendWorkspaceUserResponse>(
      SPRING_BASE,
      `/api/workspaces/${id}/members`,
      {
        method: 'POST',
        body: JSON.stringify({ userId: data.userId, roleName: data.role }),
      }
    )
    return adaptMember(res)
  },
  removeWorkspaceMember: (workspaceId: string, userId: string) =>
    request<void>(SPRING_BASE, `/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    }),
  updateMemberRole: async (workspaceId: string, userId: string, roleName: string) => {
    const res = await request<BackendWorkspaceUserResponse>(
      SPRING_BASE,
      `/api/workspaces/${workspaceId}/members/${userId}/role?roleName=${encodeURIComponent(roleName)}`,
      { method: 'PATCH' }
    )
    return adaptMember(res)
  },

  // Documents
  getDocuments: async (workspaceId: string) => {
    const res = await request<BackendDocumentResponse[]>(
      SPRING_BASE,
      `/api/documents/workspace/${workspaceId}`
    )
    return res.map((d) => ({ ...adaptDocument(d), workspaceId }))
  },
  uploadDocument: async (file: File, workspaceId: string) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('workspaceId', workspaceId)
    
    const token = getToken()
    const res = await fetch(`${SPRING_BASE}/api/documents`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    })

    if (!res.ok) {
      throw new Error('Upload failed, please try again')
    }
    
    const data = await res.json()
    return { ...adaptDocument(data), workspaceId }
  },
  getDocument: async (id: string) => {
    const res = await request<BackendDocumentResponse>(SPRING_BASE, `/api/documents/${id}`)
    return adaptDocument(res)
  },
  deleteDocument: (id: string) =>
    request<void>(SPRING_BASE, `/api/documents/${id}`, { method: 'DELETE' }),

  // FastAPI Chat (snake_case fields)
  chatStream: async (
    documentId: string,
    sessionId: string,
    message: string,
    onChunk: (text: string) => void
  ) => {
    try {
      const token = getToken()
      const res = await fetch(`${FASTAPI_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: message,
          document_id: documentId,
          session_id: sessionId,
        }),
      })
      if (!res.ok) throw new Error('Chat stream failed')
      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        // Parse SSE data lines
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            onChunk(data)
          }
        }
      }
    } catch (err: any) {
      if (err instanceof TypeError || String(err).includes('fetch') || String(err).includes('Network')) {
        const mockResponse = "This is a simulated AI response because the Python FastAPI backend is currently offline. Your document is safely uploaded to the database, and this chat feature will fully activate once the microservice is running! "
        const words = mockResponse.split(' ')
        for (let i = 0; i < words.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50))
          onChunk(words[i] + (i < words.length - 1 ? ' ' : ''))
        }
        return
      }
      throw err
    }
  },

  getSummary: async (documentId: string) => {
    try {
      return await request<{ document_id: string; summary: string }>(FASTAPI_BASE, '/chat/summary', {
        method: 'POST',
        body: JSON.stringify({ document_id: documentId }),
      })
    } catch (err: any) {
      if (String(err).includes('fetch') || String(err).includes('Network') || String(err).includes('failed')) {
        return { document_id: documentId, summary: "Mock Summary: The Python FastAPI backend is offline. When running, this will display a deep AI-generated summary of your document's contents." }
      }
      throw err
    }
  },

  getKeyPoints: async (documentId: string) => {
    try {
      return await request<{ document_id: string; key_points: string[] }>(FASTAPI_BASE, '/chat/key-points', {
        method: 'POST',
        body: JSON.stringify({ document_id: documentId }),
      })
    } catch (err: any) {
      if (String(err).includes('fetch') || String(err).includes('Network') || String(err).includes('failed')) {
        return { document_id: documentId, key_points: ["FastAPI Backend is Offline", "This is a mock key point built for hackathon demonstrations", "Start the Python server to see real indexed AI insights"] }
      }
      throw err
    }
  },

  generateQA: async (documentId: string) => {
    try {
      return await request<{ document_id: string; questions: { question: string; answer: string }[] }>(
        FASTAPI_BASE,
        '/chat/generate-questions',
        { method: 'POST', body: JSON.stringify({ document_id: documentId }) }
      )
    } catch (err: any) {
      if (String(err).includes('fetch') || String(err).includes('Network') || String(err).includes('failed')) {
        return { document_id: documentId, questions: [{ question: "Why am I seeing this mock Q&A?", answer: "Because the FastAPI Python backend is offline." }] }
      }
      throw err
    }
  },
  clearHistory: (sessionId: string) =>
    request<void>(FASTAPI_BASE, `/chat/history/${sessionId}`, {
      method: 'DELETE',
    }),
}

export default api

// ─── Frontend types (used by pages/components) ───

export interface User {
  id: string
  fullName: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  avatarUrl?: string
  companyName?: string
}

export interface Company {
  id: string
  name: string
  description?: string
  logoUrl?: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  memberCount: number
  documentCount: number
  createdAt: string
  ownerId: string
  companyName?: string
}

export interface WorkspaceMember {
  userId: string
  fullName: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  joinedAt: string
  avatarUrl?: string
}

export interface Document {
  id: string
  name: string
  size: number
  status: 'UPLOADING' | 'READY' | 'INDEXED' | 'FAILED'
  uploadedAt: string
  uploadedBy: string
  workspaceId: string
  workspaceName?: string
}
