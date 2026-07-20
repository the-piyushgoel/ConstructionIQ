"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock } from "lucide-react";
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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const response = await apiClient.post("/auth/login", data);
      
      const { token, refreshToken, user } = response.data;
      setAuth(token, refreshToken, user);
      
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || "Failed to login. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas p-4 text-text-primary">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10">
            <Lock className="h-6 w-6 text-brand-500" />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access Construction IQ.
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
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
