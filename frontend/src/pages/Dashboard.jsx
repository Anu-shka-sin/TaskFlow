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

// ── Task modal (moved OUTSIDE Dashboard — this was the bug) ────────────────
const TaskModal = ({ task, onClose, onSave }) => {
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
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
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
              required
              autoFocus
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none transition-all"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className={FULL_BUTTON}
            disabled={saving}
          >
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

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'pending' | 'completed'
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const token = localStorage.getItem('token')

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  }

  // ── Fetch tasks ─────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/tasks`, authHeaders)
      setTasks(res.data)
    } catch (err) {
      toast.error('Failed to load tasks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Create / update task ────────────────────────────────────────────────
  const handleSaveTask = async (form) => {
    try {
      if (editingTask) {
        const res = await axios.put(
          `${API_URL}/api/tasks/${editingTask._id}`,
          form,
          authHeaders
        )
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? res.data : t))
        )
        toast.success('Task updated')
      } else {
        const res = await axios.post(
          `${API_URL}/api/tasks`,
          form,
          authHeaders
        )
        setTasks((prev) => [res.data, ...prev])
        toast.success('Task added')
      }
      setShowModal(false)
      setEditingTask(null)
    } catch (err) {
      toast.error('Failed to save task')
      console.error(err)
    }
  }

  // ── Toggle status ───────────────────────────────────────────────────────
  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const res = await axios.put(
        `${API_URL}/api/tasks/${task._id}`,
        { ...task, status: newStatus },
        authHeaders
      )
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      )
    } catch (err) {
      toast.error('Failed to update task')
      console.error(err)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, authHeaders)
      setTasks((prev) => prev.filter((t) => t._id !== id))
      toast.success('Task deleted')
    } catch (err) {
      toast.error('Failed to delete task')
      console.error(err)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  // ── Derived stats ───────────────────────────────────────────────────────
  const totalCount = tasks.length
  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending'
    if (filter === 'completed') return t.status === 'completed'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">TaskFlow</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={ListTodo}
            label="Total Tasks"
            value={totalCount}
            color="bg-purple-500"
            onClick={() => setFilter('all')}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={pendingCount}
            color="bg-yellow-500"
            onClick={() => setFilter('pending')}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={completedCount}
            color="bg-green-500"
            onClick={() => setFilter('completed')}
          />
        </div>

        {/* Task list card */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              {filter === 'all'
                ? 'All Tasks'
                : filter === 'pending'
                ? 'Pending Tasks'
                : 'Completed Tasks'}
            </h2>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-6 text-center">Loading tasks…</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No tasks found.</p>
          ) : (
            <div>
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowModal(false)
            setEditingTask(null)
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  )
}

export default Dashboard
