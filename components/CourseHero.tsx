export default function CourseHero({ title, subtitle, description }: { title: string; subtitle?: string; description: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-lg opacity-80">{subtitle}</p>}
      <p className="mt-3 opacity-90">{description}</p>
    </header>
  );
}
