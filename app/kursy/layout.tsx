export default function KursyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Kursy</h1>
      {children}
    </div>
  );
}
