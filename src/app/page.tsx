
"use client";

import { LoginForm } from "@/components/auth/login-form";
import { TacoIcon } from "@/components/icons";

export default function LoginPage() {

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
            <TacoIcon className="h-20 w-20 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter mt-4 text-foreground">
                Taco Vision
            </h1>
            <p className="text-muted-foreground mt-1">
                Inventory Management
            </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
