import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { ChevronLeft, UserCircle, Lock, Save, Eye, EyeOff, Mail, User, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:4000'

// ── Tailwind class constants ────────────────────────────────────────────────
const BACK_BUTTON =
  'flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium'

const FULL_BUTTON =
  'flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm'

const DANGER_BUTTON =
  'flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors'

const INPUTWRAPPER =
  'flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-purple-300 focus-within:border-purple-400 transition-all'

const SECTION_WRAPPER =
  'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'

// ── Field configs ───────────────────────────────────────────────────────────
const personalFields = [
  { name: 'name',  type: 'text',  placeholder: 'Full name',       icon: User },
  { name: 'email', type: 'email', placeholder: 'Email address',   icon: Mail },
]

// ── Component ───────────────────────────────────────────────────────────────
const Profile = ({ setCurrentUser, handleLogout }) => {
  const navigate = useNavigate()

  const [profile,    setProfile]    = useState({ name: '', email: '' })
  const [passwords,  setPasswords]  = useState({ current: '', new: '', confirm: '' })
  const [showPw,     setShowPw]     = useState({ current: false, new: false, confirm: false })
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    axios
      .get(`${API_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data.success) setProfile({ name: data.user.name, email: data.user.email })
        else toast.error(data.message || 'Could not load profile.')
      })
      .catch(() => toast.error('Unable to load profile. Please try again.'))
  }, [navigate])

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    setSavingProfile(true)
    try {
      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success('Profile updated!')
        if (setCurrentUser) setCurrentUser(data.user)
      } else {
        toast.error(data.message || 'Update failed.')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match.')
      return
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    setSavingPassword(true)
    try {
      const { data } = await axios.put(
        `${API_URL}/api/user/password`,
        { currentPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (data.success) {
        toast.success('Password changed!')
        setPasswords({ current: '', new: '', confirm: '' })
      } else {
        toast.error(data.message || 'Password change failed.')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setSavingPassword(false)
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const onLogout = () => {
    localStorage.removeItem('token')
    if (handleLogout) handleLogout()
    navigate('/login')
  }

  // ── Toggle password visibility ────────────────────────────────────────────
  const togglePw = (field) =>
    setShowPw((prev) => ({ ...prev, [field]: !prev[field] }))

  // ── Avatar initial ────────────────────────────────────────────────────────
  const initial = profile.name ? profile.name[0].toUpperCase() : 'U'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="max-w-4xl mx-auto p-6">

        {/* Back */}
        <button onClick={() => navigate('/')} className={BACK_BUTTON}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md select-none">
            {initial}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-500 text-sm">Manage your profile and security settings</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* ── Personal Information ── */}
          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <UserCircle className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                <div key={name} className={INPUTWRAPPER}>
                  <Icon className="text-purple-400 w-5 h-5 mr-2 flex-shrink-0" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={profile[name]}
                    onChange={(e) => setProfile({ ...profile, [name]: e.target.value })}
                    className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
                    required
                  />
                </div>
              ))}

              <button type="submit" className={FULL_BUTTON} disabled={savingProfile}>
                <Save className="w-4 h-4" />
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* ── Change Password ── */}
          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <Lock className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
            </div>

            <form onSubmit={changePassword} className="space-y-4">
              {[
                { field: 'current', placeholder: 'Current password' },
                { field: 'new',     placeholder: 'New password' },
                { field: 'confirm', placeholder: 'Confirm new password' },
              ].map(({ field, placeholder }) => (
                <div key={field} className={INPUTWRAPPER}>
                  <Lock className="text-purple-400 w-5 h-5 mr-2 flex-shrink-0" />
                  <input
                    type={showPw[field] ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={passwords[field]}
                    onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                    className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePw(field)}
                    className="ml-2 text-gray-400 hover:text-purple-500 transition-colors flex-shrink-0"
                    tabIndex={-1}
                    aria-label={showPw[field] ? 'Hide password' : 'Show password'}
                  >
                    {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              ))}

              <button type="submit" className={FULL_BUTTON} disabled={savingPassword}>
                <Lock className="w-4 h-4" />
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </section>

        </div>

        {/* ── Danger Zone ── */}
        <section className={`${SECTION_WRAPPER} mt-8`}>
          <h2 className="text-base font-semibold text-red-500 mb-4">Danger Zone</h2>
          <button onClick={onLogout} className={DANGER_BUTTON}>
            <LogOut className="w-4 h-4" />
            Sign out of TaskFlow
          </button>
        </section>

      </div>
    </div>
  )
}

export default Profile