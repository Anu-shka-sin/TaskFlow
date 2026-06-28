// TaskModal.jsx  –  drop-in replacement for the inline TaskModal in Dashboard.jsx
// Requires: VITE_GEMINI_API_KEY in your .env  (free tier, gemini-2.0-flash)

import React, { useState } from "react";
import {
  X, Save, ListTodo, Sparkles, Clock, CalendarDays,
  CheckCircle2, Loader2, ChevronDown, ChevronUp
} from "lucide-react";

// ── Tailwind constants (mirrors Dashboard) ──────────────────────────────────
const INPUTWRAPPER =
  "flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white " +
  "focus-within:ring-2 focus-within:ring-purple-300 focus-within:border-purple-400 transition-all";

const FULL_BUTTON =
  "flex items-center justify-center gap-2 w-full py-2.5 px-4 " +
  "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm " +
  "font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" +
  `?key=${GEMINI_KEY}`;

// ── Gemini call ─────────────────────────────────────────────────────────────
async function fetchEstimate(title, description) {
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `
You are a task-planning assistant. Given a task, return ONLY a JSON object (no markdown fences) with:
- "effort": a T-shirt size string — one of "XS", "S", "M", "L", "XL"
- "hours": a realistic effort estimate as a number (e.g. 0.5, 2, 8)
- "dueDate": a suggested due date as "YYYY-MM-DD", based on complexity. Today is ${today}.
- "reason": one short sentence explaining the estimate.

Task title: "${title}"
Task description: "${description || "No description provided."}"
`.trim();

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

  const json = await res.json();
  const raw  = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip any accidental markdown fences before parsing
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  return JSON.parse(cleaned);
}

// ── Effort badge colour ─────────────────────────────────────────────────────
const EFFORT_COLOR = {
  XS: "bg-blue-50  text-blue-600  border-blue-200",
  S:  "bg-green-50 text-green-600 border-green-200",
  M:  "bg-yellow-50 text-yellow-600 border-yellow-200",
  L:  "bg-orange-50 text-orange-600 border-orange-200",
  XL: "bg-red-50   text-red-600   border-red-200",
};

// ── AI Suggestion card ──────────────────────────────────────────────────────
const SuggestionCard = ({ suggestion, onAccept, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
  const effortClass = EFFORT_COLOR[suggestion.effort] || EFFORT_COLOR.M;

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 space-y-3 text-sm">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
        <span className="font-semibold text-purple-700 text-xs uppercase tracking-wide">
          AI Estimate
        </span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto text-purple-400 hover:text-purple-600 transition-colors"
          aria-label="Toggle explanation"
        >
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5" />
            : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        <span className={`flex items-center gap-1 border text-xs font-semibold px-2.5 py-1 rounded-full ${effortClass}`}>
          <Clock className="w-3 h-3" />
          {suggestion.effort} · ~{suggestion.hours}h
        </span>
        <span className="flex items-center gap-1 border border-indigo-200 bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full">
          <CalendarDays className="w-3 h-3" />
          Due {new Date(suggestion.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Reason (expandable) */}
      {expanded && (
        <p className="text-xs text-purple-600 italic leading-relaxed border-t border-purple-100 pt-2">
          {suggestion.reason}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onAccept}
          className="flex items-center gap-1.5 flex-1 justify-center py-1.5 px-3 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Accept &amp; fill
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center gap-1.5 flex-1 justify-center py-1.5 px-3 bg-white text-gray-500 text-xs font-semibold rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Dismiss
        </button>
      </div>
    </div>
  );
};

// ── Main Modal ──────────────────────────────────────────────────────────────
const TaskModal = ({ task, onClose, onSave }) => {
  const [form, setForm] = useState(
    task
      ? {
          title:       task.title,
          description: task.description || "",
          priority:    task.priority    || "medium",
          dueDate:     task.dueDate     ? task.dueDate.slice(0, 10) : "",
        }
      : { title: "", description: "", priority: "medium", dueDate: "" }
  );

  const [saving,      setSaving]      = useState(false);
  const [estimating,  setEstimating]  = useState(false);
  const [suggestion,  setSuggestion]  = useState(null);
  const [aiError,     setAiError]     = useState("");

  // ── Request estimate ──────────────────────────────────────────────────────
  const handleEstimate = async () => {
    if (!form.title.trim()) {
      setAiError("Add a title first so the AI has something to work with.");
      return;
    }
    setAiError("");
    setSuggestion(null);
    setEstimating(true);
    try {
      const result = await fetchEstimate(form.title, form.description);
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      setAiError("Could not get an estimate right now. Try again in a moment.");
    } finally {
      setEstimating(false);
    }
  };

  // ── Accept suggestion ─────────────────────────────────────────────────────
  const handleAccept = () => {
    setForm((prev) => ({
      ...prev,
      dueDate: suggestion.dueDate || prev.dueDate,
      // Map effort size to priority: XS/S→low, M→medium, L/XL→high
      priority:
        ["XS", "S"].includes(suggestion.effort)
          ? "low"
          : suggestion.effort === "M"
          ? "medium"
          : "high",
    }));
    setSuggestion(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          {task ? "Edit Task" : "New Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className={INPUTWRAPPER}>
            <ListTodo className="text-purple-400 w-5 h-5 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={set("title")}
              className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none transition-all"
          />

          {/* ── AI Estimate button ── */}
          <button
            type="button"
            onClick={handleEstimate}
            disabled={estimating}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-semibold transition-all
              ${estimating
                ? "border-purple-200 bg-purple-50 text-purple-400 cursor-not-allowed"
                : "border-purple-300 bg-white text-purple-600 hover:bg-purple-50 hover:border-purple-400"
              }`}
          >
            {estimating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Suggest estimate with AI
              </>
            )}
          </button>

          {/* AI error */}
          {aiError && (
            <p className="text-xs text-red-500 -mt-1 px-1">{aiError}</p>
          )}

          {/* AI Suggestion card */}
          {suggestion && (
            <SuggestionCard
              suggestion={suggestion}
              onAccept={handleAccept}
              onDismiss={() => setSuggestion(null)}
            />
          )}

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select
                value={form.priority}
                onChange={set("priority")}
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
                onChange={set("dueDate")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              />
            </div>
          </div>

          {/* Save */}
          <button type="submit" className={FULL_BUTTON} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : task ? "Save Changes" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;