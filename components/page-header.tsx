export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
