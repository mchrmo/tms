export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main className="bg-black flex min-h-screen flex-col items-center justify-between p-24">
            <div className="flex min-h-screen flex-col items-center justify-between p-24">
                {children}
            </div>
      </main>
      );
  }
  