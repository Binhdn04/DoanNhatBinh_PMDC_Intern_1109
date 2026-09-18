import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${variant} ${className}`}
    >
      {children}
    </button>
  );
}
export function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?:
    | "neutral"
    | "positive"
    | "attention"
    | "urgent"
    | "blue"
    | "green"
    | "amber"
    | "red"
    | "violet";
}) {
  return (
    <span className={`status ${tone}`}>
      <span aria-hidden="true">●</span>
      {children}
    </span>
  );
}
export function Card({
  children,
  className = "",
  style,
  ...props
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section className={`card ${className}`} style={style} {...props}>
      {children}
    </section>
  );
}
export function PageHeader({
  title,
  description,
  action,
  crumbs,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  crumbs?: string;
}) {
  return (
    <header className="page-header">
      {crumbs && <p className="crumbs">{crumbs}</p>}
      <div className="header-row">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(
        children as ReactElement<{ id?: string; "aria-describedby"?: string }>,
        { id, "aria-describedby": hint ? `${id}-hint` : undefined },
      )
    : children;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <b aria-hidden="true"> *</b>}
      </label>
      {control}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

export const TextInput = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className="input" {...p} />
);
export const SelectInput = ({
  children,
  ...p
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className="input" {...p}>
    {children}
  </select>
);
export const TextArea = (
  p: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => <textarea className="input textarea" {...p} />;
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <Card className="empty">
      <span aria-hidden="true">○</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </Card>
  );
}
export function Timeline({
  items,
}: {
  items: Array<{ title: string; meta: string; note?: string }>;
}) {
  return (
    <ol className="timeline">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`}>
          <span aria-hidden="true" />
          <div>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
            {item.note && <p>{item.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    ref.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      returnFocus.current?.focus();
    };
  }, [onClose]);
  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const controls = ref.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
    );
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        ref={ref}
        onKeyDown={trapFocus}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-title">
          <h2 id="dialog-title">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Advisory({
  title = "Generated assistance",
  children,
  onRefresh,
}: {
  title?: string;
  children: ReactNode;
  onRefresh?: () => void;
}) {
  return (
    <aside className="advisory">
      <div>
        <span aria-hidden="true">✦</span>
        <strong>{title}</strong>
        {onRefresh && <button onClick={onRefresh}>Refresh</button>}
      </div>
      {children}
      <small>
        This is advisory only. It does not change source data or decisions.
      </small>
    </aside>
  );
}
