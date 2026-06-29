import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import {
  Clock, ChevronLeft, Trash2, CheckCircle2, Search,
  CalendarDays, Pencil, X, Save, ListTodo, AlertTriangle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL;

// ── Tailwind constants ──────────────────────────────────────────────────────
const CARD        = 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'
const BACK_BUTTON = 'flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium'
const INPUTWRAPPER = 'flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-purple-300 focus-within:border-purple-400 transition-all'
const FULL_BUTTON  = 'flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm'

const PRIORITY_BADGE = {
  high:   'bg-red-100    text-red-600   text-xs font-medium px-2 py-0.5 rounded-full',
  medium: 'bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full',
  low:    'bg-blue-100   text-blue-600  text-xs font-medium px-2 py-0.5 rounded-full',
}

// ── Overdue helper ────────────────────────────────────────────────────────────
const isOverdue = (dueDate) =>
  dueDate && new Date(dueDate) < new Date(new Date().toDateString())

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description || '',
    priority:    task.priority    || 'medium',
    dueDate:     task.dueDate     ? task.dueDate.slice(0, 10) : '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required.'); return }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-5">Edit Task</h2>

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
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none transition-all"
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
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── PendingPage ───────────────────────────────────────────────────────────────
const PendingPage = () => {
  const navigate = useNavigate()
  const [tasks,       setTasks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('all')   // all | high | medium | low | overdue
  const [editingTask, setEditingTask] = useState(null)

  const token       = () => localStorage.getItem('token')
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token()}` } })

  // ── Fetch pending tasks ───────────────────────────────────────────────────
  useEffect(() => {
    if (!token()) { navigate('/login'); return }

    axios
      .get(`${API_URL}/api/tasks?status=pending`, authHeaders())
      .then(({ data }) => {
        if (data.success) setTasks(data.tasks.filter((t) => t.status === 'pending'))
        else toast.error(data.message)
      })
      .catch(() => toast.error('Could not load pending tasks.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Mark complete ─────────────────────────────────────────────────────────
  const handleComplete = async (task) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/api/tasks/${task._id}`,
        { status: 'completed' },
        authHeaders()
      )
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== task._id))
        toast.success('Task completed! 🎉')
      } else toast.error(data.message)
    } catch {
      toast.error('Could not update task.')
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
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

  // ── Save edit ─────────────────────────────────────────────────────────────
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

  // ── Filtered + searched list ──────────────────────────────────────────────
  const filtered = tasks
    .filter((t) => {
      if (filter === 'overdue') return isOverdue(t.dueDate)
      if (filter !== 'all')    return t.priority === filter
      return true
    })
    .filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase())
    )
    // Sort: overdue first, then by priority
    .sort((a, b) => {
      if (isOverdue(a.dueDate) && !isOverdue(b.dueDate)) return -1
      if (!isOverdue(a.dueDate) && isOverdue(b.dueDate)) return 1
      const order = { high: 0, medium: 1, low: 2 }
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1)
    })

  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate)).length

  const FILTERS = [
    { key: 'all',     label: 'All' },
    { key: 'high',    label: 'High' },
    { key: 'medium',  label: 'Medium' },
    { key: 'low',     label: 'Low' },
    { key: 'overdue', label: `Overdue${overdueCount > 0 ? ` (${overdueCount})` : ''}` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back */}
        <button onClick={() => navigate('/')} className={BACK_BUTTON}>
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-sm">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pending Tasks</h1>
            <p className="text-gray-500 text-sm">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} to do
              {overdueCount > 0 && (
                <span className="ml-2 text-red-500 font-medium">
                  · {overdueCount} overdue
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white mb-4 focus-within:ring-2 focus-within:ring-purple-300 focus-within:border-purple-400 transition-all shadow-sm">
          <Search className="text-gray-400 w-4 h-4 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search pending tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                filter === key
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600'
              } ${key === 'overdue' && overdueCount > 0 && filter !== 'overdue' ? 'border-red-300 text-red-500 hover:border-red-400 hover:text-red-600' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className={CARD}>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {search || filter !== 'all'
                  ? 'No tasks match your filter.'
                  : 'No pending tasks. Great work!'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filtered.map((task) => {
                const overdue = isOverdue(task.dueDate)
                return (
                  <li key={task._id} className="flex items-start gap-3 py-4 group">

                    {/* Complete button */}
                    <button
                      onClick={() => handleComplete(task)}
                      className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
                      title="Mark complete"
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                        {task.title}
                        {overdue && (
                          <AlertTriangle className="inline w-3.5 h-3.5 ml-1.5 text-red-400 mb-0.5" />
                        )}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {task.priority && (
                          <span className={PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium}>
                            {task.priority}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                            <CalendarDays className="w-3 h-3" />
                            {overdue ? 'Overdue · ' : ''}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleComplete(task)}
                        className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  )
}

export default PendingPage
