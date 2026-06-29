import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import {
  CheckCircle2, ChevronLeft, Trash2, RotateCcw, Search, CalendarDays
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL;

// ── Tailwind constants ──────────────────────────────────────────────────────
const CARD        = 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6'
const BACK_BUTTON = 'flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6 font-medium'

const PRIORITY_BADGE = {
  high:   'bg-red-100   text-red-600   text-xs font-medium px-2 py-0.5 rounded-full',
  medium: 'bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full',
  low:    'bg-blue-100  text-blue-600  text-xs font-medium px-2 py-0.5 rounded-full',
}

// ── CompletedPage ────────────────────────────────────────────────────────────
const CompletedPage = () => {
  const navigate = useNavigate()
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const token      = () => localStorage.getItem('token')
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token()}` } })

  // ── Fetch completed tasks ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token()) { navigate('/login'); return }

    axios
      .get(`${API_URL}/api/tasks?status=completed`, authHeaders())
      .then(({ data }) => {
        if (data.success) setTasks(data.tasks.filter((t) => t.status === 'completed'))
        else toast.error(data.message)
      })
      .catch(() => toast.error('Could not load completed tasks.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Mark as pending ───────────────────────────────────────────────────────
  const handleUndo = async (task) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/api/tasks/${task._id}`,
        { status: 'pending' },
        authHeaders()
      )
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== task._id))
        toast.success('Moved back to pending.')
      } else toast.error(data.message)
    } catch {
      toast.error('Could not update task.')
    }
  }

  // ── Delete task ───────────────────────────────────────────────────────────
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

  // ── Filter by search ──────────────────────────────────────────────────────
  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase())
  )

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Completed Tasks</h1>
            <p className="text-gray-500 text-sm">{tasks.length} task{tasks.length !== 1 ? 's' : ''} done</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white mb-6 focus-within:ring-2 focus-within:ring-purple-300 focus-within:border-purple-400 transition-all shadow-sm">
          <Search className="text-gray-400 w-4 h-4 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search completed tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
          />
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
              <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {search ? 'No tasks match your search.' : 'No completed tasks yet.'}
              </p>
              {!search && (
                <p className="text-gray-300 text-sm mt-1">
                  Finish a task and it'll show up here.
                </p>
              )}
            </div>
          ) : (
            <ul className="space-y-1 divide-y divide-gray-50">
              {filtered.map((task) => (
                <li
                  key={task._id}
                  className="flex items-start gap-3 py-4 group"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 line-through truncate">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-300 truncate mt-0.5">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {task.priority && (
                        <span className={PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium}>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-gray-300">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleUndo(task)}
                      className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Move to pending"
                    >
                      <RotateCcw className="w-4 h-4" />
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
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompletedPage
