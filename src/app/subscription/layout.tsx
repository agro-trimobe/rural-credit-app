export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}
