import Link from "next/link";

interface TestLayoutProps {
  children: React.ReactNode;
}

export const TestLayout = ({ children }: TestLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600/40 to-purple-800/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/30 to-indigo-700/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-2"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-700/35 to-violet-600/35 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-4"></div>
      </div>

      {/* Minimal Header */}
      <header className="relative z-10 py-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img
              src="/testograph-logo.png"
              alt="Testograph"
              className="h-12 w-auto rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <p className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Testograph
              </p>
              <p className="text-xs text-muted-foreground">Тестостерон анализ</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-8 px-4 mt-16 border-t border-border/30">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Testograph. Образователен инструмент за оценка на тестостерон.
            <br />
            Не е предназначен като медицински съвет.
          </p>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Поверителност
            </Link>
            <span className="text-border">|</span>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Условия
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
