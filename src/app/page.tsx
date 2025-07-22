
"use client";

import { LoginForm } from "@/components/auth/login-form";
import { TacoIcon } from "@/components/icons";
import { motion } from "framer-motion";

export default function LoginPage() {

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "circOut" }}
          className="flex flex-col items-center justify-center mb-8">
            <TacoIcon className="h-20 w-20 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter mt-4 text-foreground">
                Taco Vision
            </h1>
            <p className="text-muted-foreground mt-1">
                Inventory Management
            </p>
        </motion.div>
        <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.6, delay: 0.4, ease: "circOut" }}
        >
            <LoginForm />
        </motion.div>
      </div>
    </motion.div>
  );
}
