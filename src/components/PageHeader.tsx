export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className={children ? "mb-6 border-b border-zinc-200 pb-6 dark:border-zinc-800" : "mb-6"}>
      <h1 className="font-display text-3xl font-bold uppercase italic tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
