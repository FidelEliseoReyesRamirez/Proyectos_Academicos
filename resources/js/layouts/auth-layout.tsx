export default function AuthLayout({
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return <>{children}</>;
}