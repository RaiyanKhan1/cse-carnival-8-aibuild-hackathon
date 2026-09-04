import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../Components/PageHeader'
import './SignIn.css'

// SIGN-IN FORM. ONLY REACHABLE WHILE SIGNED OUT — THE ROUTE REDIRECTS OTHERWISE.
function SignIn({ onSignIn }) {
  const navigate = useNavigate()

  // SIGNS IN WITH THE SUBMITTED DETAILS
  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const role = formData.get('role')

    onSignIn({ email, role })
    navigate('/')
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Sign in"
        subtitle="Choose your campus role and enter your account details."
      />

      <div className="card auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="name@campus.edu"
              required
              type="email"
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              minLength="6"
              name="password"
              placeholder="Enter your password"
              required
              type="password"
            />
          </label>

          <label className="auth-field">
            <span>Role</span>
            <select defaultValue="student" name="role">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </label>

          <div className="auth-actions">
            <button className="btn" type="submit">
              Sign in
            </button>
            <span className="card-meta">Session is saved on this device.</span>
          </div>

          <p className="auth-switch">
            New to CampusOS? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default SignIn
