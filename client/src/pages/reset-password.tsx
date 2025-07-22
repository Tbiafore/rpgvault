import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Redirect } from "wouter";
import { CheckCircle, AlertCircle, Lock, ArrowRight } from "lucide-react";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters long"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [resetComplete, setResetComplete] = useState(false);
  
  // Extract token from URL query parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const token = urlParams.get('token');

  // Redirect if no token
  if (!token) {
    return <Redirect to="/auth" />;
  }

  // Validate token on mount
  const { data: tokenValidation, isLoading: validatingToken, error: tokenError } = useQuery({
    queryKey: ["/api/validate-reset-token", token],
    queryFn: async () => {
      const res = await fetch(`/api/validate-reset-token/${token}`);
      return await res.json();
    },
    retry: false,
  });

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const res = await apiRequest("POST", "/api/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password Reset Successful",
        description: data.message,
      });
      setResetComplete(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = async (data: ResetPasswordData) => {
    try {
      await resetPasswordMutation.mutateAsync(data);
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (tokenError || !tokenValidation?.valid) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This password reset link is invalid or has expired.
            </p>
            <p className="text-sm text-gray-500">
              Reset links expire after 30 minutes for security reasons.
            </p>
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="w-full bg-purple-700 hover:bg-purple-600"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state after password reset
  if (resetComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <CardTitle className="text-xl">Password Reset Complete</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your password has been successfully reset!
            </p>
            <p className="text-sm text-gray-500">
              You can now log in with your new password.
            </p>
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="w-full bg-purple-700 hover:bg-purple-600"
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <CardTitle className="text-xl">Reset Your Password</CardTitle>
          <p className="text-gray-600 text-sm">
            Enter your new password below.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...form.register("newPassword")}
                placeholder="Enter your new password"
                disabled={resetPasswordMutation.isPending}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register("confirmPassword")}
                placeholder="Confirm your new password"
                disabled={resetPasswordMutation.isPending}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-700 hover:bg-purple-600"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={() => window.location.href = "/auth"}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}