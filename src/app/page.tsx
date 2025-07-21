"use client";

import { LoginForm } from "@/components/auth/login-form";
import { LogoIcon } from "@/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

type AnimationState = "idle" | "loading" | "success" | "fail";

export default function LoginPage() {
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const router = useRouter();

  const handleLoginStart = () => {
    setAnimationState("loading");
  };

  const handleLoginResult = (success: boolean) => {
    if (success) {
      setAnimationState("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000); // Wait for animation to finish before navigating
    } else {
      setAnimationState("fail");
      setTimeout(() => setAnimationState("idle"), 1000); // Return to idle after fail animation
    }
  };
  
  const logoVariants = {
    idle: {
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
    loading: {
      y: "35vh",
      scale: 1.5,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
    success: {
        y: -50,
        x: -120,
        scale: 0.3,
        opacity: 1,
        transition: { duration: 0.7, ease: "easeInOut" },
    },
    fail: {
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const pageVariants = {
    idle: {
        filter: "blur(0px)",
        transition: { duration: 0.5 },
    },
    loading: {
        filter: "blur(8px)",
        transition: { duration: 0.5 },
    },
    success: {
        filter: "blur(0px)",
        transition: { duration: 0.7 },
    },
    fail: {
        filter: "blur(0px)",
        transition: { duration: 0.5 },
    },
  };


  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence>
        <motion.div
            className="absolute inset-0 z-10 flex items-start justify-center pt-24"
            variants={logoVariants}
            animate={animationState}
        >
            <LogoIcon className="h-20 w-20 text-foreground" />
        </motion.div>
      </AnimatePresence>

      <motion.main
        className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
        variants={pageVariants}
        animate={animationState}
      >
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="h-20 w-20" />
            <h1 className="text-4xl font-bold tracking-tighter mt-4">
              Lumen
            </h1>
            <p className="text-muted-foreground mt-1">Inventory Management</p>
          </div>
          <LoginForm 
            onLoginStart={handleLoginStart}
            onLoginResult={handleLoginResult}
          />
        </div>
      </motion.main>
    </div>
  );
}