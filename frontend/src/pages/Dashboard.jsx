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
// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ handleLogout }) => {
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

