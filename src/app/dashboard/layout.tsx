"use client";

import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useState, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TacoIcon } from '@/components/icons';

type AppContextType = {
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  return (
    <AppContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </AppContext.Provider>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <SidebarProvider>
        <div className="flex">
          <AppSidebar />
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </div>
      </SidebarProvider>
    </AppProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isNavigating } = useAppContext();

  return (
    <SidebarInset>
        <div className="relative flex-1">
          <div
            className={`transition-filter duration-700 ${
              isNavigating ? 'blur-sm' : 'blur-0'
            }`}
          >
              <Header />
              {children}
          </div>

          <AnimatePresence>
            {isNavigating && (
              <motion.div
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, rotate: [0, -15, 15, 0], transition: { yoyo: Infinity, duration: 1 } }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <TacoIcon className="h-24 w-24 text-primary" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </SidebarInset>
  );
}
