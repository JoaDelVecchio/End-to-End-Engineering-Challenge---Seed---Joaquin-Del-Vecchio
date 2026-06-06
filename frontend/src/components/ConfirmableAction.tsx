import { useState } from "react";
import type { ReactNode } from "react";

export function ConfirmableAction({
  cancelLabel = "Cancelar",
  confirmDescription,
  confirmLabel = "Confirmar",
  confirmTitle,
  disabled = false,
  icon,
  isPending = false,
  onConfirm,
  pendingLabel,
  triggerLabel,
  variant = "secondary"
}: {
  cancelLabel?: string;
  confirmDescription?: string;
  confirmLabel?: string;
  confirmTitle: string;
  disabled?: boolean;
  icon?: ReactNode;
  isPending?: boolean;
  onConfirm: () => Promise<void>;
  pendingLabel?: string;
  triggerLabel: string;
  variant?: "primary" | "secondary";
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="inline-confirmation" role="group" aria-label={confirmTitle}>
        <span className="inline-confirmation-copy">
          <strong>{confirmTitle}</strong>
          {confirmDescription ? <small>{confirmDescription}</small> : null}
        </span>
        <span className="inline-confirmation-actions">
          <button
            className="secondary-button compact-button"
            disabled={disabled || isPending}
            type="button"
            onClick={() => setIsConfirming(false)}
          >
            {cancelLabel}
          </button>
          <button
            className="primary-button compact-button"
            disabled={disabled || isPending}
            type="button"
            onClick={() => {
              setIsConfirming(false);
              void onConfirm();
            }}
            aria-busy={isPending}
          >
            {isPending && pendingLabel ? pendingLabel : confirmLabel}
          </button>
        </span>
      </div>
    );
  }

  return (
    <button
      className={`${variant}-button`}
      disabled={disabled || isPending}
      type="button"
      onClick={() => setIsConfirming(true)}
      aria-busy={isPending}
    >
      {icon}
      {isPending && pendingLabel ? pendingLabel : triggerLabel}
    </button>
  );
}
