"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "btn-primary",
  formAction,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  /** A different server action for this button than the form's own. */
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending, action } = useFormStatus();
  const isThisButton = !formAction || action === formAction;
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className={`${className} disabled:opacity-60`}
    >
      {pending && isThisButton ? pendingLabel : children}
    </button>
  );
}
