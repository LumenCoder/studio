import { LoginForm } from "@/components/auth/login-form";
import { TacoIcon } from "@/components/icons";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
          <TacoIcon className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold tracking-tighter mt-4">
            Taco Vision
          </h1>
          <p className="text-muted-foreground mt-1">Lumen, stock V.82691¹</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
