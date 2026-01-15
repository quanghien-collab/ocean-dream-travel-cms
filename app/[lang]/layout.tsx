export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: "vi" | "en" };
}) {
  return (
    <html lang={params.lang}>
      <body>
        {children}
      </body>
    </html>
  );
}
