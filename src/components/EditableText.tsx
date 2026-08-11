"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { useEditMode } from "./EditModeProvider";
import { useEditToast } from "./EditToast";

const BLOCK_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "div"]);

type EditableTextProps = {
  path: string;
  defaultValue: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
  id?: string;
};

export function EditableText({
  path,
  defaultValue,
  as: Tag = "span",
  className = "",
  multiline = false,
  id,
}: EditableTextProps) {
  const editMode = useEditMode();
  const { showToast } = useEditToast();
  const [value, setValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setValue(defaultValue);
    if (!editing) setDraft(defaultValue);
  }, [defaultValue, editing]);

  useEffect(() => {
    if (editing && editableRef.current) {
      editableRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editing]);

  function startEditing(event?: MouseEvent | KeyboardEvent) {
    event?.stopPropagation();
    event?.preventDefault();
    setDraft(value);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(value);
    setError(null);
    setEditing(false);
  }

  async function save() {
    const nextValue = draft.trim();
    if (!nextValue) {
      setError("Text cannot be empty");
      showToast("Text cannot be empty", "error");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, value: nextValue }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        const message =
          payload?.error ??
          (response.status === 401
            ? "Not authorized — re-enable edit mode at /admin/edit"
            : "Save failed");
        throw new Error(message);
      }

      setValue(nextValue);
      setDraft(nextValue);
      setEditing(false);
      showToast("Saved!", "success");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Save failed";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!multiline && event.key === "Enter") {
      event.preventDefault();
      void save();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    const next = event.relatedTarget as HTMLElement | null;
    if (next?.dataset?.editableAction) return;
    if (editing) cancelEditing();
  }

  if (!editMode) {
    return createElement(Tag, { className, id }, value);
  }

  const tagName = typeof Tag === "string" ? Tag : "span";
  const Wrapper = BLOCK_TAGS.has(tagName) ? "div" : "span";
  const editHighlight =
    "cursor-pointer rounded-sm ring-2 ring-brass/40 ring-offset-2 ring-offset-bone transition-shadow hover:ring-brass/70";

  if (editing) {
    return (
      <Wrapper className="relative w-full align-baseline">
        {createElement(Tag, {
          ref: editableRef,
          id,
          className: `${className} rounded-sm outline outline-2 outline-brass/60 outline-offset-2`,
          contentEditable: true,
          suppressContentEditableWarning: true,
          onInput: (event: Event) => {
            const target = event.currentTarget as HTMLElement;
            setDraft(target.innerText);
          },
          onKeyDown: handleKeyDown,
          onBlur: handleBlur,
          role: "textbox",
          "aria-label": `Edit ${path}`,
        }, draft)}
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-editable-action="save"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-brass px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-bone hover:bg-brass/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            data-editable-action="cancel"
            onClick={cancelEditing}
            disabled={saving}
            className="rounded-full border border-charcoal/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal/70 hover:border-charcoal/35 disabled:opacity-50"
          >
            Cancel
          </button>
          {error ? <span className="text-[11px] text-red-600">{error}</span> : null}
        </span>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      className={`group relative max-w-full align-baseline ${
        BLOCK_TAGS.has(tagName) ? "pr-10" : "inline-flex items-start gap-1.5"
      }`}
    >
      {createElement(Tag, {
        className: `${className} ${editHighlight}`,
        id,
        onClick: startEditing,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" || event.key === " ") startEditing(event);
        },
        role: "button",
        tabIndex: 0,
        title: "Click to edit",
      }, value)}
      <button
        type="button"
        onClick={startEditing}
        className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-brass bg-bone text-sm font-bold text-brass shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
          BLOCK_TAGS.has(tagName)
            ? "absolute right-0 top-0 h-8 w-8"
            : "h-7 w-7"
        }`}
        aria-label={`Edit ${path}`}
        title="Edit text"
      >
        ✎
      </button>
    </Wrapper>
  );
}
