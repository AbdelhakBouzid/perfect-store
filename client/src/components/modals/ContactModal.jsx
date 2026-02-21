import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import Input from "../ui/Input";

const INITIAL_FORM = {
  email: "",
  message: ""
};

export default function ContactModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.message.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          message: form.message.trim()
        })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || t("contact.failed"));
      }

      setForm(INITIAL_FORM);
      onClose();
      onSuccess?.(t("contact.success"));
    } catch (error) {
      onSuccess?.(error.message || t("contact.failed"));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-lg p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{t("contact.title")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("contact.subtitle")}</p>
          </div>
          <button
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label={t("contact.email")}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="name@example.com"
            type="email"
            value={form.email}
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{t("contact.message")}</span>
            <textarea
              className="input-base min-h-[130px] resize-y"
              onChange={(event) => setField("message", event.target.value)}
              placeholder={t("contact.messagePlaceholder")}
              value={form.message}
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={onClose} type="button" variant="ghost">
              {t("actions.cancel")}
            </Button>
            <Button disabled={isSending} type="submit" variant="primary">
              {isSending ? t("contact.sending") : t("contact.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
