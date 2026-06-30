import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

import {
  CheckCircle2, Clock, ListTodo, Plus, LogOut, User,
  Trash2, Pencil, X, Save, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL;

// ── Tailwind constants ──────────────────────────────────────────────────────
const CARD =
  'bg-white rounded-2xl shadow-sm border border-gray-100 p-5'

const INPUTWRAPPER =
  'flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-purple-300 focus-within:border-purple-400 transition-all'

const FULL_BUTTON =
  'flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm'

const BADGE = {
  pending:   'bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full',
  completed: 'bg-green-100  text-green-700  text-xs font-medium px-2 py-0.5 rounded-full',
}

const PRIORITY_BADGE = {
  high:   'bg-red-100   text-red-600   text-xs font-medium px-2 py-0.5 rounded-full',
  medium: 'bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full',
  low:    'bg-blue-100  text-blue-600  text-xs font-medium px-2 py-0.5 rounded-full',
}

// ── Stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${CARD} flex items-center gap-4 w-full text-left hover:shadow-md transition-shadow cursor-pointer`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
  </button>
)

// ── Task row ─────────────────────────────────────────────────────────────────
const TaskRow = ({ task, onToggle, onDelete, onEdit }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group">
    <button
      onClick={() => onToggle(task)}
      className="mt-0.5 flex-shrink-0"
      title={task.status === 'completed' ? 'Mark pending' : 'Mark complete'}
    >
      {task.status === 'completed'
        ? <CheckCircle2 className="w-5 h-5 text-purple-500" />
        : <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-purple-400 transition-colors" />
      }
    </button>

    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {task.title}
      </p>
      {task.description && (
        <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mt-1">
        <span className={BADGE[task.status] || BADGE.pending}>{task.status}</span>
        {task.priority && (
          <span className={PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium}>
            {task.priority}
          </span>
        )}
        {task.dueDate && (
          <span className="text-xs text-gray-400">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>

    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(task)}
        className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(task._id)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
)


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          {task ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={INPUTWRAPPER}>
            <ListTodo className="text-purple-400 w-5 h-5 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
              required
              autoFocus
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none transition-all"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              />
            </div>
          </div>

          <button type="submit" className={FULL_BUTTON} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : task ? 'Save Changes' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ handleLogout }) => {
  const navigate = useNavigate()
  const [tasks,       setTasks]       = useState([])
  const [userName,    setUserName]    = useState('')
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const token = () => localStorage.getItem('token')

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token()}` } })

  // ── Fetch tasks ────────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/tasks`, authHeaders())
      if (data.success) setTasks(data.tasks)
      else toast.error(data.message)
    } catch {
      toast.error('Could not load tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token()) { navigate('/login'); return }
    // Load user name
    axios.get(`${API_URL}/api/user/me`, authHeaders())
      .then(({ data }) => { if (data.success) setUserName(data.user.name) })
      .catch(() => {})
    fetchTasks()
  }, [])

  // ── Add task ───────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/tasks`, form, authHeaders())
      if (data.success) {
        setTasks((prev) => [data.task, ...prev])
        setModalOpen(false)
        toast.success('Task added!')
      } else toast.error(data.message)
    } catch {
      toast.error('Could not add task.')
    }
  }

  // ── Edit task ──────────────────────────────────────────────────────────────
  const handleEdit = async (form) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/api/tasks/${editingTask._id}`, form, authHeaders()
      )
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? data.task : t)))
        setEditingTask(null)
        toast.success('Task updated!')
      } else toast.error(data.message)
    } catch {
      toast.error('Could not update task.')
    }
  }

  // ── Toggle status ──────────────────────────────────────────────────────────
  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const { data } = await axios.put(
        `${API_URL}/api/tasks/${task._id}`,
        { status: newStatus },
        authHeaders()
      )
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? data.task : t)))
      } else toast.error(data.message)
    } catch {
      toast.error('Could not update task.')
    }
  }

  // ── Delete task ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${API_URL}/api/tasks/${id}`, authHeaders())
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== id))
        toast.success('Task deleted.')
      } else toast.error(data.message)
    } catch {
      toast.error('Could not delete task.')
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const onLogout = () => {
    localStorage.removeItem('token')
    if (handleLogout) handleLogout()
    navigate('/login')
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total     = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const pending   = tasks.filter((t) => t.status === 'pending').length
  const recentTasks = [...tasks].slice(0, 5)

  // ── Greeting ───────────────────────────────────────────────────────────────
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
            TaskFlow
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{userName || 'Profile'}</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Here's what's on your plate today.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={ListTodo}
            label="Total Tasks"
            value={total}
            color="bg-gradient-to-br from-purple-500 to-fuchsia-500"
            onClick={() => navigate('/tasks')}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={pending}
            color="bg-gradient-to-br from-yellow-400 to-orange-400"
            onClick={() => navigate('/pending')}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={completed}
            color="bg-gradient-to-br from-green-400 to-emerald-500"
            onClick={() => navigate('/completed')}
          />
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className={`${CARD} mb-8`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
              <p className="text-sm font-bold text-purple-600">
                {Math.round((completed / total) * 100)}%
              </p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {completed} of {total} tasks completed
            </p>
          </div>
        )}

        {/* Recent tasks */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Tasks</h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-sm text-purple-500 hover:text-purple-700 font-medium transition-colors"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No tasks yet. Add your first one!</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-purple-500 text-sm font-medium hover:underline"
              >
                + Add a task
              </button>
            </div>
          ) : (
            recentTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={(t) => setEditingTask(t)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <TaskModal onClose={() => setModalOpen(false)} onSave={handleAdd} />
      )}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  )
}

export default Dashboard
