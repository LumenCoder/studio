import { LoginForm } from "@/components/auth/login-form";
import { LogoIcon } from "@/components/icons";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <LogoIcon className="h-20 w-20 text-foreground" />
          <h1 className="text-4xl font-bold tracking-tighter mt-4">
            Lumen
          </h1>
          <p className="text-muted-foreground mt-1">Inventory Management</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
