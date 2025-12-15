"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Define the background pattern
const backgroundPattern = `
  .bg-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
`;

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
});

export default function AdminLoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Custom styles for the form inputs
    const inputClasses =
        "h-11 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Check if already logged in
    useEffect(() => {
        const adminData = localStorage.getItem("admin");
        if (adminData) {
            try {
                const parsed = JSON.parse(adminData);
                if (parsed.admin) {
                    router.push("/admin");
                }
            } catch (e) {
                // Invalid data, clear it
                localStorage.removeItem("admin");
            }
        }
    }, [router]);

    // Apply the background pattern style
    useEffect(() => {
        const styleElement = document.getElementById("background-pattern-style") ||
            document.createElement("style");

        if (!document.getElementById("background-pattern-style")) {
            styleElement.id = "background-pattern-style";
            styleElement.innerHTML = backgroundPattern;
            document.head.appendChild(styleElement);
        }

        return () => {
            // Clean up when component unmounts (optional)
            // document.head.removeChild(styleElement);
        };
    }, []);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setError("");

        try {
            // Simulated delay for user experience
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Demo credentials
            const DEMO_EMAIL = "demo@admin.com";
            const DEMO_PASSWORD = "demo1234";

            // Check credentials
            if (data.email === DEMO_EMAIL && data.password === DEMO_PASSWORD) {
                // Store login info in localStorage
                localStorage.setItem(
                    "admin",
                    JSON.stringify({
                        email: data.email,
                        admin: true,
                        timestamp: Date.now()
                    })
                );

                // Redirect to admin dashboard
                router.push("/admin");
            } else {
                setError("Invalid email or password. Please use demo@admin.com / demo1234");
            }
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-md"
        >
            <motion.div
                className="flex justify-center mb-8"
            >
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-full p-4 shadow-lg shadow-primary/20 ring-4 ring-white/30 dark:ring-slate-800/30">
                    <Shield className="h-10 w-10 text-primary-foreground" />
                </div>
            </motion.div>

            <motion.div >
                <Card className="border-none shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-slate-950/90">
                    <CardHeader className="space-y-2 pb-6">
                        <CardTitle className="text-2xl font-bold text-center text-blue-500">
                            Admin Login
                        </CardTitle>
                        <CardDescription className="text-center text-slate-600 dark:text-slate-400">
                            Enter your credentials to access the admin panel
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-8">
                        {/* Demo credentials info */}
                        <div className="mb-6 p-4 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-900">
                            <p className="text-blue-600 dark:text-blue-400 text-sm">
                                <strong>Demo Credentials:</strong><br />
                                Email: demo@admin.com<br />
                                Password: demo1234
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <Alert
                                    variant="destructive"
                                    className="border-red-300 bg-red-50 dark:bg-red-950/50 dark:border-red-900"
                                >
                                    <AlertDescription className="text-red-600 dark:text-red-400">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Input
                                    placeholder="demo@admin.com"
                                    {...register("email")}

                                />
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-red-500"
                                    >
                                        {errors.email.message}
                                    </motion.p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Input
                                        {...register("password")}

                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-red-500"
                                    >
                                        {errors.password.message}
                                    </motion.p>
                                )}
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button
                                    type="submit"
                                    className="w-full h-11 font-medium text-base bg-blue-500 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "linear",
                                            }}
                                            className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                                        />
                                    ) : null}
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                    <CardFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-lg">
                        <motion.p

                            className="text-center text-sm text-slate-600 dark:text-slate-400 w-full"
                        >
                            Forgot your password?{" "}
                            <a
                                href="#"
                                className="text-primary font-medium hover:underline transition-colors"
                            >
                                Reset it here
                            </a>
                        </motion.p>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    );
}