"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api/client";

import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/Card";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError(null);
      const response = await apiClient.post("/auth/register", data);
      
      const { tokens: { accessToken: token, refreshToken }, user } = response.data.data;
      setAuth(token, refreshToken, user);
      
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiError = err as { response?: { status?: number, data?: { error?: { message?: string }, message?: string } } };
      if (apiError.response?.status === 409) {
         setError("This email is already registered. Please sign in instead.");
      } else {
         setError(apiError.response?.data?.error?.message || apiError.response?.data?.message || "Failed to register. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas p-4 text-text-primary">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
            <UserPlus className="h-6 w-6 text-brand-500" />
          </div>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Enter your details to get started with Construction IQ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
            {error && (
              <div className="rounded-md bg-risk-critical-bg p-sm text-body-sm text-risk-critical-text border border-risk-critical-border">
                {error}
              </div>
            )}
            
            <div className="space-y-xs">
              <label className="text-body-sm font-medium text-text-primary">
                Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                {...register("name")}
                error={!!errors.name}
              />
              {errors.name && (
                <p className="text-body-sm text-risk-critical-text">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-xs">
              <label className="text-body-sm font-medium text-text-primary">
                Email
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                error={!!errors.email}
              />
              {errors.email && (
                <p className="text-body-sm text-risk-critical-text">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-xs">
              <label className="text-body-sm font-medium text-text-primary">
                Password
              </label>
              <Input
                type="password"
                {...register("password")}
                error={!!errors.password}
              />
              {errors.password && (
                <p className="text-body-sm text-risk-critical-text">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full">
              Create Account
            </Button>

            <div className="mt-4 text-center text-body-sm text-text-secondary">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-brand-500 hover:text-brand-400">
                Sign In
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
