'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
// Context untuk Navbar Action
interface NavbarActionContextType {
  buttonAction?: React.ReactNode;
  setButtonAction: (action?: React.ReactNode) => void;
}

const NavbarActionContext = createContext<NavbarActionContextType | undefined>(undefined);

export function useNavbarAction() {
  const ctx = useContext(NavbarActionContext);
  if (!ctx) throw new Error('useNavbarAction must be used within NavbarActionProvider');
  return ctx;
}
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Users, UserCheck, Trophy, Award, FileText, Menu, Bell, Settings, LogOut, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // role yang boleh melihat menu ini
  children?: {
    name: string;
    href: string;
    roles?: string[];
  }[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
    roles: ['user', 'admin', 'super_admin'],
  },
  {
    name: 'Lembaga',
    href: '/institution',
    icon: Building,
    roles: ['admin', 'super_admin'],
  },
  {
    name: 'Anggota',
    href: '/member',
    icon: UserCheck,
    roles: ['user', 'admin', 'super_admin'],
  },
  {
    name: 'TKU',
    href: '/tku',
    icon: Trophy,
    roles: ['user', 'admin', 'super_admin'],
  },
  {
    name: 'TKK',
    href: '/tkk',
    icon: Award,
    roles: ['user', 'admin', 'super_admin'],
  },
  {
    name: 'Garuda',
    href: '/garuda',
    icon: Award,
    roles: ['user', 'admin', 'super_admin'],
  },
  {
    name: 'Jenis TKK',
    href: '/type-tkk',
    icon: FileText,
    roles: ['admin', 'super_admin'],
  },
  {
    name: 'User',
    href: '/user',
    icon: Users,
    roles: ['super_admin'],
  },
];

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function Sidebar({ className, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) => (prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName]));
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Logo */}
      <div className={cn('flex items-center gap-2', isCollapsed ? 'justify-center px-1 py-4' : 'p-6')}>
        <Image src="/image/logo.png" alt="Logo" width={90} height={90} />
        {!isCollapsed && <span className="text-lg font-bold text-gray-900">Garuda Penegak</span>}
      </div>
      <span className="mx-auto px-3 py-1 rounded-full bg-orange-50 text-xs text-orange-600 -mt-2">
        Versi: <span className="font-semibold">Beta</span>
      </span>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;
          const isAuthorized = !item.roles || (session && item.roles.includes(session.user.role));

          return (
            <div key={item.name} className="px-2">
              {isAuthorized && (
                <Button
                  className={`w-full h-[43px] justify-start bg-transparent rounded-lg shadow-none font-semibold hover:text-white hover:bg-primary-500 ${isActive ? 'text-white bg-primary-500' : 'text-gray-700'}`}
                  onClick={() => {
                    if (hasChildren && !isCollapsed) {
                      toggleExpanded(item.name);
                    }
                  }}
                  title={isCollapsed ? item.name : undefined}
                >
                  {hasChildren ? (
                    <div className="flex items-center w-full">
                      <item.icon className={cn('w-4 h-4', isCollapsed ? '' : 'mr-3')} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded ? 'rotate-180' : '')} />
                        </>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className={cn('w-4 h-4', isCollapsed ? '' : 'mr-3')} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  )}
                </Button>
              )}

              {/* Submenu */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children?.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Button
                        key={child.name}
                        variant={isChildActive ? 'default' : 'ghost'}
                        className={cn('w-full justify-start h-9 px-3 text-sm', isChildActive ? 'bg-primary-500 text-white hover:bg-primary-600' : 'text-gray-600 hover:bg-gray-100')}
                        asChild
                      >
                        <Link href={child.href}>{child.name}</Link>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      {onToggleCollapse && (
        <div className="p-4 border-t">
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className={cn('w-full', isCollapsed ? 'justify-center' : 'justify-start')} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4 mr-2" />}
            {!isCollapsed && <span>Collapse</span>}
          </Button>
        </div>
      )}
    </div>
  );
}

interface NavbarProps {
  onMenuClick: () => void;
  buttonAction?: React.ReactNode;
}

// Optional: subtitle per menu
const menuSubtitles: Record<string, string> = {
  Dashboard: 'Ringkasan aktivitas dan statistik',
  Lembaga: 'Kelola data lembaga',
  Anggota: 'Kelola data anggota',
  TKU: 'Kelola data TKU',
  TKK: 'Kelola data TKK',
  'Jenis TKK': 'Kelola jenis TKK',
  Rekap: 'Rekapitulasi data anggota',
  User: 'Kelola user admin',
};

function Navbar({ buttonAction, onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Cari menu aktif
  const activeMenu = sidebarItems.find((item) => item.href === pathname);
  const title = activeMenu ? activeMenu.name : 'Dashboard';
  const subtitle = activeMenu ? menuSubtitles[activeMenu.name] : '';

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '-';
  const userInitial = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  useEffect(() => {
    console.log(session);
  }, [session]);

  return (
    <header className="flex items-center justify-between px-4 mb-4 lg:px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title or breadcrumb */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <div className="text-gray-500 mt-1">{subtitle}</div>}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {buttonAction}

        {/* Notifications */}
        <Button size="icon" className=" bg-white text-primary-500 hover:bg-gray-50 shadow">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="relative uppercase font-semibold bg-white hover:bg-gray-50 text-primary-500 shadow">
              {session?.user?.institution_name || session?.user?.name}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [buttonAction, setButtonAction] = useState<React.ReactNode>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <NavbarActionContext.Provider value={{ buttonAction, setButtonAction }}>
      <div className="flex h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div className={cn('hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300', sidebarCollapsed ? 'lg:w-16' : 'lg:w-60')}>
          <div className="flex-1 flex flex-col min-h-0 shadow bg-white">
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapse} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className={cn('mt-6 flex-1 flex flex-col transition-all duration-300 min-w-0 max-w-full', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60')}>
          <Navbar onMenuClick={() => setSidebarOpen(true)} buttonAction={buttonAction} />

          {/* Page content */}
          <main className="flex-1 overflow-auto min-w-0">
            <div className="p-6 pt-2 min-w-0 max-w-full">{children}</div>
          </main>
        </div>
      </div>
    </NavbarActionContext.Provider>
  );
}
