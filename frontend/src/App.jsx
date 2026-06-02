import { useEffect, useMemo, useState } from 'react'

const NOTES_API = '/api/notes'
const AUTH_API = '/api/auth'

const AUTH_KEY = 'notesapp.auth'
const TEMP_KEY = 'notesapp.tempNotes'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return ''
  }
}

async function apiFetch(path, { token, method, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, {
    method: method || 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const text = await res.text()
  const data = text ? safeJsonParse(text) : null

  if (!res.ok) {
    const message = data?.message || data?.error || (typeof data === 'string' ? data : null) || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function tempId() {
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export default function App() {
  const [auth, setAuth] = useState(() => readJson(AUTH_KEY, null))
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState(null)

  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [banner, setBanner] = useState(null)

  const [editor, setEditor] = useState({ heading: '', content: '' })
  const [editorError, setEditorError] = useState(null)

  const isSignedIn = !!auth?.token

  useEffect(() => {
    loadNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn])

  useEffect(() => {
    if (!isSignedIn) {
      const temp = readJson(TEMP_KEY, [])
      setNotes(Array.isArray(temp) ? temp : [])
      setLoading(false)
    }
  }, [isSignedIn])

  const selected = useMemo(() => notes.find(n => String(n.id) === String(selectedId)) || null, [notes, selectedId])

  useEffect(() => {
    if (selected) setEditor({ heading: selected.heading ?? '', content: selected.content ?? '' })
    else setEditor({ heading: '', content: '' })
  }, [selected])

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(n =>
      (n.heading || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    )
  }, [notes, search])

  const scopeLabel = isSignedIn ? 'Saved notes' : 'Temp notes'

  async function loadNotes() {
    setBanner(null)
    setLoading(true)

    if (!isSignedIn) {
      const temp = readJson(TEMP_KEY, [])
      setNotes(Array.isArray(temp) ? temp : [])
      setLoading(false)
      return
    }

    try {
      const data = await apiFetch(NOTES_API, { token: auth.token })
      setNotes(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e.status === 401) {
        signOut()
        setBanner('Session expired. You are now viewing temp notes.')
      } else {
        setBanner('Cannot reach the backend. Start Spring Boot on http://localhost:8000')
      }
    } finally {
      setLoading(false)
    }
  }

  function persistTemp(next) {
    writeJson(TEMP_KEY, next)
  }

  function startNewNote() {
    setSelectedId(null)
    setEditor({ heading: '', content: '' })
    setEditorError(null)
  }

  async function saveNote() {
    const heading = editor.heading.trim()
    const content = editor.content.trim()
    const errs = []
    if (!heading) errs.push('Heading is required')
    if (!content) errs.push('Content is required')
    if (errs.length) {
      setEditorError(errs.join(' · '))
      return
    }

    setEditorError(null)

    if (!isSignedIn) {
      const nowIso = new Date().toISOString()

      if (selected) {
        const next = notes.map(n => String(n.id) === String(selected.id) ? { ...n, heading, content } : n)
        setNotes(next)
        persistTemp(next)
        return
      }

      const created = { id: tempId(), heading, content, createdAt: nowIso }
      const next = [created, ...notes]
      setNotes(next)
      persistTemp(next)
      setSelectedId(created.id)
      return
    }

    try {
      if (selected) {
        await apiFetch(`${NOTES_API}/${selected.id}`, { token: auth.token, method: 'PATCH', body: { heading, content } })
      } else {
        await apiFetch(NOTES_API, { token: auth.token, method: 'POST', body: { heading, content } })
      }
      await loadNotes()
      startNewNote()
    } catch (e) {
      setBanner(e.message)
    }
  }

  async function deleteSelected() {
    if (!selected) return
    if (!window.confirm('Delete this note?')) return

    if (!isSignedIn) {
      const next = notes.filter(n => String(n.id) !== String(selected.id))
      setNotes(next)
      persistTemp(next)
      startNewNote()
      return
    }

    try {
      await apiFetch(`${NOTES_API}/${selected.id}`, { token: auth.token, method: 'DELETE' })
      await loadNotes()
      startNewNote()
    } catch (e) {
      setBanner(e.message)
    }
  }

  async function submitAuth() {
    setAuthError(null)
    const email = authForm.email.trim()
    const password = authForm.password
    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }

    try {
      const path = authMode === 'register' ? `${AUTH_API}/register` : `${AUTH_API}/login`
      const data = await apiFetch(path, { method: 'POST', body: { email, password } })
      const next = { token: data.token, email: data.email }
      setAuth(next)
      writeJson(AUTH_KEY, next)
      setShowAuth(false)
      setAuthForm({ email: '', password: '' })
      setBanner(null)
    } catch (e) {
      setAuthError(e.message)
    }
  }

  function signOut() {
    setAuth(null)
    localStorage.removeItem(AUTH_KEY)
    setSelectedId(null)
    setShowAuth(false)
  }

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', nextIsDark)
    localStorage.setItem('notesapp.theme', nextIsDark ? 'dark' : 'light')
  }

  return (
    <div className="container">
      <div className="appShell">
        <div className="header">
          <div className="brand">
            <h1>Notes</h1>
            <span className="pill">{scopeLabel} · {notes.length}</span>
          </div>

          <div className="toolbar">
            <button className="btn btnGhost" onClick={toggleTheme} type="button">
              Toggle theme
            </button>

            {isSignedIn ? (
              <>
                <span className="pill">{auth.email}</span>
                <button className="btn" onClick={signOut} type="button">Sign out</button>
              </>
            ) : (
              <button className="btn btnPrimary" onClick={() => setShowAuth(v => !v)} type="button">
                Sign in
              </button>
            )}
          </div>
        </div>

        {showAuth && !isSignedIn && (
          <div className="card panel">
            <div className="stack" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Sign in to save notes</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    Signed out mode keeps notes locally in this browser.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={`btn ${authMode === 'login' ? 'btnPrimary' : ''}`} type="button" onClick={() => setAuthMode('login')}>Sign in</button>
                  <button className={`btn ${authMode === 'register' ? 'btnPrimary' : ''}`} type="button" onClick={() => setAuthMode('register')}>Create account</button>
                </div>
              </div>

              {authError && <div className="banner">{authError}</div>}

              <div className="mainGrid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
                <div className="stack">
                  <div className="label">Email</div>
                  <input className="input" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div className="stack">
                  <div className="label">Password</div>
                  <input className="input" type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="••••••••" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn" type="button" onClick={() => setShowAuth(false)}>Cancel</button>
                <button className="btn btnPrimary" type="button" onClick={submitAuth}>
                  {authMode === 'register' ? 'Create account' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>
        )}

        {banner && <div className="banner">{banner}</div>}

        <div className="mainGrid">
          <div className="card panel">
            <div className="stack">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700 }}>Your notes</div>
                <button className="btn btnPrimary" type="button" onClick={startNewNote}>+ New</button>
              </div>

              <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />

              {loading ? (
                <div className="pill" style={{ justifyContent: 'center' }}>Loading…</div>
              ) : filteredNotes.length === 0 ? (
                <div className="pill" style={{ justifyContent: 'center' }}>{search ? 'No matches' : 'No notes yet'}</div>
              ) : (
                <div className="noteList">
                  {filteredNotes.map(n => {
                    const isSel = String(n.id) === String(selectedId)
                    return (
                      <div
                        key={n.id}
                        className={`noteItem ${isSel ? 'noteItemSelected' : ''}`}
                        onClick={() => setSelectedId(isSel ? null : n.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(isSel ? null : n.id) }}
                      >
                        <p className="noteTitle">{n.heading || 'Untitled'}</p>
                        <p className="noteBody">{(n.content || '').slice(0, 120)}{(n.content || '').length > 120 ? '…' : ''}</p>
                        <p className="noteMeta">{formatDate(n.createdAt)}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card panel">
            <div className="stack">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700 }}>{selected ? 'Edit note' : 'Write a note'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" type="button" onClick={loadNotes}>Refresh</button>
                  <button className="btn btnDanger" type="button" onClick={deleteSelected} disabled={!selected} style={!selected ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}>
                    Delete
                  </button>
                </div>
              </div>

              {editorError && <div className="banner">{editorError}</div>}

              <div className="stack">
                <div className="label">Heading</div>
                <input className="input" value={editor.heading} onChange={e => setEditor({ ...editor, heading: e.target.value })} placeholder="A clear heading…" />
              </div>

              <div className="stack">
                <div className="label">Content</div>
                <textarea className="textarea" value={editor.content} onChange={e => setEditor({ ...editor, content: e.target.value })} placeholder="Write something you can find later…" />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn" type="button" onClick={startNewNote}>Clear</button>
                <button className="btn btnPrimary" type="button" onClick={saveNote}>
                  {selected ? 'Save changes' : (isSignedIn ? 'Save note' : 'Save temp note')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          Created by Jagan Jijo · <a href="https://jagan-jijo.github.io/portfolio/" target="_blank" rel="noopener">Portfolio</a> · <a href="https://www.linkedin.com/in/jagan-jijo/" target="_blank" rel="noopener">LinkedIn</a>
        </div>
      </div>
    </div>
  )
}