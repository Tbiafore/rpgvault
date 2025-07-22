import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useCallback } from "react";
import { debouncedNavigate, setNavigationInProgress } from "@/utils/navigation-guard";

interface LoginPromptProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionName: string;
}

export function LoginPrompt({ isOpen, onOpenChange, actionName }: LoginPromptProps) {
  const [location, setLocation] = useLocation();

  const handleLoginRedirect = useCallback(() => {
    try {
      // Close the dialog first
      onOpenChange(false);
      
      // Store current location to return to after login (but not if we're already on auth page)
      if (location && location !== "/auth") {
        try {
          sessionStorage.setItem('returnTo', location);
        } catch (storageError) {
          console.warn("Could not store return location:", storageError);
        }
      }
      
      // Use window.location.href for more reliable navigation that doesn't trigger plugin errors
      setTimeout(() => {
        window.location.href = "/auth";
      }, 100);
      
    } catch (error) {
      console.error("Login redirect error:", error);
      onOpenChange(false);
    }
  }, [location, onOpenChange]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to log in or create an account to {actionName}. 
            Creating an account is free and takes just a minute!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLoginRedirect}>
            Log In / Sign Up
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}