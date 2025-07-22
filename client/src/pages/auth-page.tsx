import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import type { InsertUser } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Dice6, Star, MessageSquare, TrendingUp, ArrowLeft, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const res = await apiRequest("POST", "/api/forgot-password", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset link sent",
        description: data.message,
      });
      setActiveTab("login");
      forgotPasswordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending reset link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Redirect if already logged in (after all hooks are called)
  if (user) {
    try {
      const returnTo = sessionStorage.getItem('returnTo');
      if (returnTo && returnTo !== "/auth") {
        try {
          sessionStorage.removeItem('returnTo');
          // Use window.location.href for more reliable redirect
          setTimeout(() => {
            window.location.href = returnTo;
          }, 100);
          return null; // Don't render anything while redirecting
        } catch (storageError) {
          console.warn("Session storage error:", storageError);
        }
      }
      // Use window.location.href for home redirect too
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      return null;
    } catch (error) {
      console.error("Auth redirect error:", error);
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      return null;
    }
  }

  const handleLogin = async (data: LoginData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = async (data: InsertUser) => {
    try {
      await registerMutation.mutateAsync(data);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
    } catch (error) {
      console.error("Forgot password error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to The RPG Vault</h1>
            <p className="text-gray-400">Join the ultimate RPG community</p>
          </div>

          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {activeTab !== "forgot-password" ? (
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("login")}
                      className="p-0 h-auto"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-lg font-medium">Reset Password</CardTitle>
                  </div>
                )}
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...loginForm.register("username")}
                        placeholder="Enter your username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500 mt-1">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                        placeholder="Enter your password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-700 hover:bg-purple-600"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                  
                  <div className="text-center mt-4">
                    <button 
                      type="button"
                      onClick={() => setActiveTab("forgot-password")}
                      className="text-sm text-purple-600 hover:text-purple-500 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        {...registerForm.register("username")}
                        placeholder="Choose a username"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500 mt-1">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerForm.register("email")}
                        placeholder="Enter your email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        {...registerForm.register("password")}
                        placeholder="Create a password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-700 hover:bg-purple-600"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="forgot-password" className="space-y-4">
                  <div className="text-center mb-4">
                    <Mail className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                    <p className="text-gray-600 text-sm">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                  
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-email">Email Address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        {...forgotPasswordForm.register("email")}
                        placeholder="Enter your email"
                      />
                      {forgotPasswordForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {forgotPasswordForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-purple-700 hover:bg-purple-600"
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                  
                  <div className="text-center mt-4">
                    <button 
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-purple-700 to-purple-900 p-8 flex items-center justify-center">
        <div className="text-white text-center max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Join the Adventure</h2>
          <p className="text-xl text-purple-100 mb-8">
            Connect with fellow RPG enthusiasts, discover new games, and share your adventures.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <Dice6 className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm">Discover RPGs</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <Star className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm">Write Reviews</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <MessageSquare className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm">Join Discussions</p>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <TrendingUp className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm">Track Rankings</p>
            </div>
          </div>
          
          <p className="text-purple-200">
            "The best place to discover your next favorite RPG!"
          </p>
        </div>
      </div>
    </div>
  );
}
