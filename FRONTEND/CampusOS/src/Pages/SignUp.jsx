import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../Components/PageHeader'
import './SignIn.css'

// DISPLAYS THE ACCOUNT REGISTRATION FORM
function SignUp({ onSignUp }) {
  const navigate = useNavigate()

  // CREATES A LOCAL ACCOUNT FROM THE SUBMITTED DETAILS
  function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const confirmInput = form.elements.confirmPassword

    if (password !== confirmPassword) {
      confirmInput.setCustomValidity('Passwords must match.')
      confirmInput.reportValidity()
      return
    }

    confirmInput.setCustomValidity('')
    onSignUp({
      email: formData.get('email'),
      name: formData.get('name'),
      role: formData.get('role'),
    })
    navigate('/')
  }

  // CLEARS THE PASSWORD MATCH MESSAGE
  function handlePasswordInput(event) {
    event.currentTarget.setCustomValidity('')
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Create an account"
        subtitle="Register as a student or faculty member to use CampusOS."
      />

      <div className="card auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Full name</span>
            <input
              autoComplete="name"
              name="name"
              placeholder="Enter your full name"
              required
              type="text"
            />
          </label>

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
            <span>Role</span>
            <select defaultValue="student" name="role">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              autoComplete="new-password"
              minLength="6"
              name="password"
              placeholder="Create a password"
              required
              type="password"
            />
          </label>

          <label className="auth-field">
            <span>Confirm password</span>
            <input
              autoComplete="new-password"
              minLength="6"
              name="confirmPassword"
              onInput={handlePasswordInput}
              placeholder="Enter the password again"
              required
              type="password"
            />
          </label>

          <div className="auth-actions">
            <button className="btn" type="submit">
              Sign up
            </button>
            <span className="card-meta">Account is saved on this device.</span>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default SignUp
