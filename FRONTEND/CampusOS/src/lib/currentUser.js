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
