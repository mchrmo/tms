

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="px-4 lg:px-8 py-6">
      {children}
    </div>
  )
}
