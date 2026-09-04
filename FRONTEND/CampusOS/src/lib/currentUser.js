/* ============================================================================
   WHO IS SIGNED IN.
   ----------------------------------------------------------------------------
   A placeholder until auth exists. This student appears across the seed data's
   event registrations, so the dashboard reads as theirs. Replace the object
   with whatever your auth returns — the shape is all the UI depends on.
   ========================================================================== */

export const currentUser = {
  name: 'Sakibul Hassan',
  studentId: '20-40532',
  program: 'CSE · Level 4, Term 1',
  // Set to an image URL and the avatar uses it instead of the initials.
  avatarUrl: null,
}

// "Sakibul Hassan" -> "SH"
export function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts.at(-1)[0] : ''
  return (first + last).toUpperCase()
}

/**
 * Who the agent should act as. Prefers the real signed-in session written by
 * App.jsx; falls back to the placeholder above so the agent still has a name
 * and student ID to work with while auth is a stub.
 */
export function getAgentUser() {
  let session
  try {
    session = JSON.parse(localStorage.getItem('campus-user') || 'null')
  } catch {
    session = null
  }

  return {
    name: session?.name || currentUser.name,
    studentId: session?.studentId || currentUser.studentId,
    email: session?.email || null,
    role: session?.role || 'student',
  }
}
