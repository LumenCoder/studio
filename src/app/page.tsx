"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { TacoIcon } from "@/components/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleLoginStart = () => {
    setIsLoading(true);
    setIsSuccess(false);
  };

  const handleLoginResult = (success: boolean) => {
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200); // Allow time for success animation
    } else {
      setIsLoading(false);
      setIsSuccess(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: isSuccess ? [0, 0] : [0, -15, 15, 0],
                  transition: {
                    rotate: { yoyo: Infinity, duration: 1 },
                    scale: { duration: 0.4 },
                    opacity: { duration: 0.4 },
                  },
                }}
                className="transition-colors duration-500"
              >
                <TacoIcon
                  className={`h-24 w-24 ${
                    isSuccess ? "text-green-500" : "text-primary"
                  }`}
                />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isSuccess ? "success" : "loading"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-muted-foreground"
                >
                  {isSuccess ? "Welcome, Arturo!" : "Signing in..."}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center justify-center mb-8">
                <TacoIcon className="h-20 w-20 text-primary" />
                <h1 className="text-4xl font-bold tracking-tighter mt-4 text-foreground">
                  Taco Vision
                </h1>
                <p className="text-muted-foreground mt-1">
                  Inventory Management
                </p>
              </div>
              <LoginForm
                onLoginStart={handleLoginStart}
                onLoginResult={handleLoginResult}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
