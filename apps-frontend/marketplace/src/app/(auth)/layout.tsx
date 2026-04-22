export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-white max-w-lg mx-auto">
      {children}
    </div>
  );
}
