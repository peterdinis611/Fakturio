import { cn } from "@/shared/lib/utils";

type Props = {
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  delay?: number;
};

export function ProfileSection({
  index,
  title,
  description,
  children,
  className,
  footer,
  delay = 0,
}: Props) {
  return (
    <section
      className={cn("profile-section profile-reveal", className)}
      data-delay={delay || undefined}
      aria-labelledby={`profile-section-${index}`}
    >
      <header className="profile-section-head">
        <div className="min-w-0">
          <h2
            id={`profile-section-${index}`}
            className="profile-section-title"
          >
            {title}
          </h2>
          {description ? (
            <p className="profile-section-desc">{description}</p>
          ) : null}
        </div>
        <span className="profile-section-index" aria-hidden>
          {index}
        </span>
      </header>
      <div className="profile-section-body">{children}</div>
      {footer}
    </section>
  );
}
