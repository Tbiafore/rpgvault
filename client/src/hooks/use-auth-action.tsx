import { useState } from "react";
import { useAuth } from "./use-auth";
import { AuthModal } from "@/components/auth-modal";

interface UseAuthActionResult {
  executeAction: (action: () => void, actionName: string) => void;
  LoginPromptComponent: () => JSX.Element;
}

export function useAuthAction(): UseAuthActionResult {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentActionName, setCurrentActionName] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const executeAction = (action: () => void, actionName: string) => {
    try {
      if (user) {
        action();
      } else {
        setCurrentActionName(actionName);
        setPendingAction(() => action);
        setShowAuthModal(true);
      }
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const handleAuthSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const LoginPromptComponent = () => (
    <AuthModal
      isOpen={showAuthModal}
      onOpenChange={setShowAuthModal}
      actionName={currentActionName}
      onSuccess={handleAuthSuccess}
    />
  );

  return {
    executeAction,
    LoginPromptComponent,
  };
}