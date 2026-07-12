import type {
  ActionState,
} from "./types";

interface ActionButtonsProps {
  state?: ActionState;
  disabled: boolean;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionButtons({
  state,
  disabled,
  confirmText,
  onConfirm,
  onCancel,
}: ActionButtonsProps) {
  if (state === "completed") {
    return (
      <p className="mt-4 rounded-xl border border-[#53c5e966] bg-[#53c5e91a] p-3 text-sm font-medium text-[#2a5970]">
        Operación completada.
      </p>
    );
  }

  if (state === "cancelled") {
    return (
      <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
        Operación cancelada.
      </p>
    );
  }

  return (
    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-[#2f3841] transition hover:border-[#2a5970] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancelar
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="rounded-xl bg-[#2a5970] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2f3841] focus:outline-none focus:ring-4 focus:ring-[#53c5e94d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "saving"
          ? "Guardando…"
          : confirmText}
      </button>
    </div>
  );
}