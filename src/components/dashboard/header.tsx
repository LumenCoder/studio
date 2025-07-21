import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from 'next/navigation'
import { useMemo } from 'react';


const getTitle = (pathname: string) => {
    switch (pathname) {
        case '/dashboard':
            return 'Overview';
        case '/dashboard/inventory':
            return 'Inventory Management';
        case '/dashboard/users':
            return 'User Management';
        case '/dashboard/settings':
            return 'Settings';
        default:
            return 'Dashboard';
    }
}

export function Header() {
  const pathname = usePathname();
  const title = useMemo(() => getTitle(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <SidebarTrigger className="sm:hidden" />
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <ModeToggle />
    </header>
  );
}
