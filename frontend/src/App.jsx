// useState  — lets us store and update values that cause the UI to re-render when changed
// useEffect — lets us run code after the component first appears on screen (e.g. load data)
import { useState, useEffect } from 'react'

// ─── API — one fetch call per backend endpoint ────────────────────────────────
// All requests go to /api/notes. Vite proxies that path to http://localhost:8000
// so we never hard-code the backend URL here (see vite.config.js → server.proxy).
//
//   GET    /api/notes        → fetch all notes
//   POST   /api/notes        → create a new note       (body: { heading, content })
//   PATCH  /api/notes/{id}   → update an existing note (body: { heading, content })
//   DELETE /api/notes/{id}   → delete a note
// ─────────────────────────────────────────────────────────────────────────────

const API = '/api/notes'

// fetch() is built into the browser — no extra library needed.
// We send JSON for POST/PATCH so the Content-Type header tells Spring Boot how to parse the body.
const getNotes   = ()         => fetch(API).then(r => r.json())
const postNote   = (data)     => fetch(API,            { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
const patchNote  = (id, data) => fetch(`${API}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
const deleteNote = (id)       => fetch(`${API}/${id}`, { method: 'DELETE' })

// ─── App ──────────────────────────────────────────────────────────────────────
// This is the single React component that contains all state and UI.
// React will re-render the UI automatically whenever any state value changes.
export default function App() {

  // ── State ──────────────────────────────────────────────────────────────────
  // useState([]) starts notes as an empty array; setNotes() replaces it and triggers a re-render.
  const [notes,    setNotes]    = useState([])    // all notes fetched from the API
  const [selected, setSelected] = useState(null)  // the note the user clicked — shows Edit/Delete buttons
  const [form,     setForm]     = useState(null)  // null = form is hidden | { heading, content } = form is open
  const [errors,   setErrors]   = useState({})    // validation errors keyed by field name e.g. { heading: 'required' }

  // ── Load ───────────────────────────────────────────────────────────────────
  // useEffect with [] runs loadNotes once when the component first mounts (page load).
  // Without [], it would run on every re-render which would cause an infinite loop.
  useEffect(() => { loadNotes() }, [])

  async function loadNotes() {
    const data = await getNotes()
    // Sort newest-first so the most recently created note appears at the top
    setNotes(data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)))
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  // Open a blank form for a new note.
  // We also clear selected so saveForm knows this is a create, not an update.
  function clickAdd() {
    setSelected(null)
    setForm({ heading: '', content: '' })
    setErrors({})
  }

  // Open the form pre-filled with the selected note's current values for editing.
  function clickEdit() {
    setForm({ heading: selected.heading, content: selected.content })
    setErrors({})
  }

  // Called when the form is submitted (Save button).
  // We validate first so we never send an empty note to the backend.
  // If selected is set → PATCH (update), otherwise → POST (create).
  async function saveForm(e) {
    e.preventDefault()  // stop the browser from reloading the page on form submit

    // Client-side validation — check both fields have content
    const errs = {}
    if (!form.heading.trim()) errs.heading = 'Heading is required'
    if (!form.content.trim()) errs.content = 'Content is required'
    if (Object.keys(errs).length) {
      setErrors(errs)  // show error messages and highlight the fields
      return           // stop here — don't call the API
    }

    setErrors({})  // clear any previous errors before saving
    selected ? await patchNote(selected.id, form) : await postNote(form)
    setForm(null)      // hide the form
    setSelected(null)  // deselect the note
    loadNotes()        // refresh the list so the new/updated note appears
  }

  // Ask the user to confirm before deleting — avoids accidental deletions.
  async function confirmDelete() {
    if (!window.confirm('Delete this note?')) return
    await deleteNote(selected.id)
    setSelected(null)  // clear selection since the note no longer exists
    loadNotes()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  // JSX looks like HTML but it's actually JavaScript.
  // Curly braces {} let us embed JS expressions inside JSX.
  // All styles are inline objects — no separate CSS file needed.
  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '32px 16px 0', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 22, color: '#333' }}>My Notes</h1>
          <button onClick={clickAdd} style={styles.btnPrimary}>+ Add Note</button>
        </div>

        {/* ── Add / Edit form ──────────────────────────────────────────────
            {form && ...} means "only render this block when form is not null".
            The form title changes to 'Edit Note' vs 'New Note' based on whether
            a note is currently selected.                                      */}
        {form && (
          <form onSubmit={saveForm} style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 6, padding: 16, marginBottom: 20 }}>
            <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#333' }}>{selected ? 'Edit Note' : 'New Note'}</p>

            {/* Heading input — border turns red if validation fails */}
            <input
              placeholder="Heading" value={form.heading}
              onChange={e => setForm({ ...form, heading: e.target.value })}
              style={{ ...styles.input, borderColor: errors.heading ? '#dc3545' : '#ccc' }}
            />
            {/* Show error message below the field if it failed validation */}
            {errors.heading && <p style={styles.errMsg}>{errors.heading}</p>}

            {/* Content textarea — same red-border pattern as heading */}
            <textarea
              placeholder="Content" value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              style={{ ...styles.input, minHeight: 80, resize: 'vertical', borderColor: errors.content ? '#dc3545' : '#ccc' }}
            />
            {errors.content && <p style={styles.errMsg}>{errors.content}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit"                                                   style={styles.btnSuccess}>Save</button>
              {/* Cancel clears both the form and any validation errors */}
              <button type="button" onClick={() => { setForm(null); setErrors({}) }} style={styles.btnMuted}>Cancel</button>
            </div>
          </form>
        )}

        {/* ── Notes list ───────────────────────────────────────────────────
            If there are no notes show an empty-state message.
            Otherwise map over the array — each note becomes a card.
            Clicking a card sets it as 'selected' (or deselects if already selected).
            The selected card is highlighted with a blue border and background.  */}
        {notes.length === 0
          ? <p style={{ color: '#aaa', textAlign: 'center', padding: 32 }}>No notes yet. Click <strong>+ Add Note</strong> to start.</p>
          : notes.map(note => {
              const isSelected = selected?.id === note.id  // is this the currently selected card?
              return (
                <div
                  key={note.id}  // React needs a unique key when rendering a list
                  onClick={() => setSelected(isSelected ? null : note)}  // toggle selection
                  style={{ border: `1px solid ${isSelected ? '#007bff' : '#eee'}`, borderRadius: 6, padding: 14, marginBottom: 10, cursor: 'pointer', background: isSelected ? '#f0f7ff' : '#fafafa' }}
                >
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#222' }}>{note.heading}</h3>
                  <p  style={{ margin: '0 0 6px', fontSize: 14, color: '#555' }}>{note.content}</p>
                  <p  style={{ margin: 0,         fontSize: 12, color: '#999' }}>{new Date(note.createdDate).toLocaleString()}</p>

                  {/* Edit / Delete buttons — only rendered when this card is selected.
                      stopPropagation() stops the button click from also firing the
                      card's onClick (which would deselect the note immediately).    */}
                  {isSelected && (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button onClick={clickEdit}     style={styles.btnWarning}>Edit</button>
                      <button onClick={confirmDelete} style={styles.btnDanger}>Delete</button>
                    </div>
                  )}
                </div>
              )
            })
        }

      </div>

      {/* ── Footer — sits below the notes card, inside the grey background ── */}
      <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', padding: '16px 0 24px', margin: 0 }}>
        A notes project using a React frontend and Spring Boot backend &mdash; created by Jagan Jijo &nbsp;|&nbsp;
        <a href="https://jagan-jijo.github.io/portfolio/" target="_blank" rel="noopener" style={{ color: '#007bff', textDecoration: 'none' }}>Portfolio</a>
        &nbsp;&middot;&nbsp;
        <a href="https://www.linkedin.com/in/jagan-jijo/" target="_blank" rel="noopener" style={{ color: '#007bff', textDecoration: 'none' }}>LinkedIn</a>
      </p>
    </div>
  )
}

// ─── Button styles ────────────────────────────────────────────────────────────
// Defined outside the component so they are not recreated on every render.
// Each button variant spreads the shared 'base' style and adds its own colour.
const base = { border: 'none', borderRadius: 4, padding: '7px 14px', fontSize: 13, cursor: 'pointer', color: '#fff' }
const styles = {
  btnPrimary: { ...base, background: '#007bff' },  // Add Note
  btnSuccess: { ...base, background: '#28a745' },  // Save
  btnWarning: { ...base, background: '#f0ad4e' },  // Edit
  btnDanger:  { ...base, background: '#dc3545' },  // Delete
  btnMuted:   { ...base, background: '#888' },     // Cancel
  input:      { display: 'block', width: '100%', padding: '8px 10px', marginBottom: 4,  border: '1px solid #ccc', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' },
  errMsg:     { margin: '0 0 10px', fontSize: 12, color: '#dc3545' },  // red text under invalid field
}