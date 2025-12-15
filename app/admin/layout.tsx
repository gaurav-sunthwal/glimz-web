"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Skip auth check if we're on the auth page
        if (pathname === "/admin/auth") {
            setIsLoading(false);
            setIsAuthenticated(true);
            return;
        }

        // Check if user is authenticated
        const adminData = localStorage.getItem("admin");

        if (!adminData) {
            // Not authenticated, redirect to login
            router.push("/admin/auth");
            return;
        }

        try {
            const parsed = JSON.parse(adminData);

            // Check if admin flag is set
            if (!parsed.admin) {
                localStorage.removeItem("admin");
                router.push("/admin/auth");
                return;
            }

            // Optional: Check if session is expired (24 hours)
            const timestamp = parsed.timestamp || 0;
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (now - timestamp > twentyFourHours) {
                // Session expired
                localStorage.removeItem("admin");
                router.push("/admin/auth");
                return;
            }

            // User is authenticated
            setIsAuthenticated(true);
        } catch (e) {
            // Invalid data, clear and redirect
            localStorage.removeItem("admin");
            router.push("/admin/auth");
            return;
        } finally {
            setIsLoading(false);
        }
    }, [pathname, router]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Only render children if authenticated or on auth page
    if (!isAuthenticated && pathname !== "/admin/auth") {
        return null;
    }

    // Render with background pattern for auth page
    if (pathname === "/admin/auth") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 bg-pattern">
                {children}
            </div>
        );
    }

    // Render normally for authenticated admin pages
    return <>{children}</>;
}
