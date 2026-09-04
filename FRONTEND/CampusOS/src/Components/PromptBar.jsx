import { useEffect, useRef, useState } from 'react'
import { askCampusAgent, isAgentConfigured, toHistory } from '../lib/campusAgent'
import './PromptBar.css'

// SHOWN AS ONE-TAP STARTERS WHILE THE THREAD IS EMPTY
const SUGGESTIONS = [
  'When is my next class?',
  'What assignments are due this week?',
  "I'm free until 2 PM — anything on campus I could drop into?",
  'Which labs have a projector and fit 30 people?',
]

let messageId = 0
const nextId = () => `msg-${++messageId}`

// ASK BAR FOR THE CAMPUS AGENT. ALL NETWORK WORK LIVES IN lib/campusAgent.js
function PromptBar() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)

  const textareaRef = useRef(null)
  const threadEndRef = useRef(null)
  const abortRef = useRef(null)

  // GROW THE TEXTAREA WITH ITS CONTENT, UP TO THE MAX HEIGHT SET IN CSS
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [draft])

  // KEEP THE NEWEST TURN IN VIEW
  useEffect(() => {
    if (messages.length) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [messages])

  // CANCEL ANY IN-FLIGHT REQUEST IF THE PAGE GOES AWAY
  useEffect(() => () => abortRef.current?.abort(), [])

  async function send(question) {
    const trimmed = question.trim()
    if (!trimmed || pending) return

    const userMessage = { id: nextId(), role: 'user', text: trimmed }
    const placeholder = { id: nextId(), role: 'agent', text: '', pending: true }

    // Snapshot the turns BEFORE this one — that's what the agent gets as history.
    const history = toHistory(messages)

    setMessages((prev) => [...prev, userMessage, placeholder])
    setDraft('')
    setPending(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const reply = await askCampusAgent({
        question: trimmed,
        history,
        signal: controller.signal,
      })
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholder.id ? { ...m, ...reply, pending: false } : m)),
      )
    } catch (err) {
      const stopped = err?.name === 'AbortError'
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? {
                ...m,
                pending: false,
                error: !stopped,
                text: stopped ? 'Stopped.' : (err?.message ?? 'Something went wrong.'),
              }
            : m,
        ),
      )
    } finally {
      abortRef.current = null
      setPending(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    // ENTER SENDS, SHIFT+ENTER MAKES A NEW LINE
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(draft)
    }
  }

  const hasThread = messages.length > 0

  return (
    <section className="prompt-panel" aria-labelledby="prompt-heading">
      <header className="prompt-head">
        <span className="prompt-spark" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="prompt-spark-icon">
            <path
              d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"
              fill="currentColor"
            />
          </svg>
        </span>

        <div className="prompt-head-text">
          <h2 id="prompt-heading">Ask CampusOS</h2>
          <p className="prompt-head-sub">
            Rooms, schedules, events, deadlines — one question away.
          </p>
        </div>

        <span
          className={`badge ${isAgentConfigured ? 'badge-success' : 'badge-neutral'}`}
          title={
            isAgentConfigured
              ? 'Connected to the agent endpoint'
              : 'Set VITE_AGENT_ENDPOINT to connect the agent'
          }
        >
          <span className={isAgentConfigured ? 'status-dot' : 'status-dot status-dot-idle'} />
          {isAgentConfigured ? 'Live' : 'Not connected'}
        </span>
      </header>

      {hasThread && (
        <div className="prompt-thread" role="log" aria-live="polite" aria-busy={pending}>
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          <div ref={threadEndRef} />
        </div>
      )}

      <form
        className="prompt-form"
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
        }}
      >
        <label className="sr-only" htmlFor="prompt-input">
          Ask the campus agent a question
        </label>

        <textarea
          id="prompt-input"
          ref={textareaRef}
          className="prompt-input"
          rows={1}
          value={draft}
          placeholder="Ask anything about campus…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {pending ? (
          <button
            type="button"
            className="prompt-send prompt-send-stop"
            onClick={() => abortRef.current?.abort()}
            aria-label="Stop generating"
          >
            <span className="stop-square" />
          </button>
        ) : (
          <button
            type="submit"
            className="prompt-send"
            disabled={!draft.trim()}
            aria-label="Send question"
          >
            <svg viewBox="0 0 24 24" className="send-icon" aria-hidden="true">
              <path
                d="M5 12h13M12 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </form>

      {!hasThread && (
        <ul className="prompt-suggestions stagger">
          {SUGGESTIONS.map((s, i) => (
            <li key={s} style={{ '--i': i }}>
              <button type="button" className="suggestion" onClick={() => send(s)}>
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ONE TURN IN THE THREAD
function Message({ message }) {
  const { role, text, pending, error, sources = [], action, status } = message

  if (role === 'user') {
    return (
      <div className="msg msg-user">
        <p className="msg-bubble">{text}</p>
      </div>
    )
  }

  return (
    <div className={`msg msg-agent${error ? ' msg-error' : ''}`}>
      <span className="msg-avatar" aria-hidden="true">
        C
      </span>

      <div className="msg-body">
        {pending ? (
          <span className="typing" aria-label="Thinking">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <>
            {status === 'clarify' && <span className="badge badge-info">Needs detail</span>}
            {status === 'refused' && <span className="badge badge-warning">Declined</span>}

            <p className="msg-text">{text}</p>

            {action && (
              <p className="msg-action">
                <span className="badge badge-success">Done</span>
                <span>
                  {action.label}
                  {action.detail && <em> — {action.detail}</em>}
                </span>
              </p>
            )}

            {sources.length > 0 && (
              <p className="msg-sources">
                <span className="msg-sources-label">Read from</span>
                {sources.map((s) => (
                  <span key={s} className="badge badge-neutral">
                    {s}
                  </span>
                ))}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PromptBar
