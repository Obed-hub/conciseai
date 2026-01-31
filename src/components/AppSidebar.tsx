import {
  Settings,
  History,
  Camera,
  Mic,
  FileText,
  Sparkles,
  MessageSquare,
  Brain,
  Zap,
  Globe
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

const modeItems = [
  { title: 'Chat', icon: MessageSquare, description: 'General conversation' },
  { title: 'Key Takeaway', icon: Brain, description: 'Important notes & summary' },
  { title: 'Search Engine', icon: Globe, description: 'Web search & concise answers' },
  { title: 'Voice', icon: Mic, description: 'Voice command interface' },
];

const toolItems = [
  { title: 'Vision', icon: Camera, description: 'Solve MCQs from images' },
  { title: 'Voice Workspace', icon: Mic, description: 'Voice notes & transcription' },
  { title: 'Documents', icon: FileText, description: 'PDF analysis' },
];

const historyItems = [
  { title: 'Summarize this article...', time: '2m ago' },
  { title: 'What is quantum computing?', time: '1h ago' },
  { title: 'Solve this MCQ...', time: '3h ago' },
  { title: 'Translate to Spanish', time: 'Yesterday' },
];

interface AppSidebarProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
  onToolClick: (tool: string) => void;
}

import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { PricingModal } from "./PricingModal";
import { AuthModal } from "./AuthModal";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { SettingsModal } from "./SettingsModal";

export function AppSidebar({ activeMode, onModeChange, onToolClick }: AppSidebarProps) {
  const { state, isMobile } = useSidebar();
  const { fuelCredits, powerCredits, tier, openPricingModal } = useSubscription();
  const { user } = useAuth();

  // On mobile, the sidebar is a drawer (Sheet), so it should always render as "expanded" content-wise when open.
  // "collapsed" state only applies to desktop rail mode.
  const isCollapsed = state === 'collapsed' && !isMobile;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
    >
      <PricingModal />
      {/* ... (existing content) ... */}

      {/* Header */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md overflow-hidden">
            <img src="/logo.png" alt="Gulugu Logo" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground leading-none">Gulugu</span>
              <span className="text-[10px] text-muted-foreground leading-none mt-1">Short and concise AI</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-2 py-4">
        {/* Mode Selection */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground/70 tracking-wider mb-2">
              Mode
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {modeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onModeChange(item.title)}
                    isActive={activeMode === item.title}
                    tooltip={item.title}
                    className={`
                      transition-all duration-200 h-auto py-2
                      ${activeMode === item.title
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${activeMode === item.title && "text-primary"}`} />
                    {!isCollapsed && (
                      <div className="flex flex-col gap-0.5 ml-2 text-left">
                        <span className="font-medium text-sm">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground/80 font-normal leading-tight">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 opacity-50" />

        {/* Tools */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground/70 tracking-wider mb-2">
              Tools
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onToolClick(item.title)}
                    tooltip={item.title}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 h-auto py-2"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex flex-col gap-0.5 ml-2 text-left">
                        <span className="font-medium text-sm">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground/80 font-normal leading-tight">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2 opacity-50" />

        {/* History */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold uppercase text-muted-foreground/70 tracking-wider mb-2 flex items-center">
              <History className="w-3 h-3 mr-2" />
              History
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {historyItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200 h-9"
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full ml-2 min-w-0 gap-2">
                        <span className="font-normal text-xs truncate flex-1 text-left">{item.title}</span>
                        <span className="text-[9px] text-muted-foreground/60 whitespace-nowrap">{item.time}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Settings & Subscription */}
      <SidebarFooter className="p-4 border-t border-border gap-2">
        <div className="flex flex-col gap-2">
          {user ? (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
              <div className="relative w-8 h-8">
                <img
                  src={`/avatars/Number=${(user.uid.charCodeAt(0) % 20) + 1}.png`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-border bg-background"
                  onError={(e) => {
                    // Fallback to initial if image fails
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{user.displayName || 'User'}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full">
              <AuthModal />
            </div>
          )}
        </div>

        {!isCollapsed && user && (
          <div className="bg-muted/50 rounded-lg p-3 mb-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">{tier} Plan</span>
              <button onClick={openPricingModal} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md font-medium hover:bg-primary/90 transition-colors">Upgrade</button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span>Fuel</span>
                <span className="font-mono">{fuelCredits}</span>
              </div>
              {powerCredits > 0 && (
                <div className="flex justify-between text-xs text-orange-500">
                  <span>Power</span>
                  <span className="font-mono">{powerCredits}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SettingsModal>
              <SidebarMenuButton
                tooltip="Settings"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                {!isCollapsed && <span className="font-normal">Settings</span>}
              </SidebarMenuButton>
            </SettingsModal>
          </SidebarMenuItem>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => signOut(auth)}
                tooltip="Log Out"
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                {!isCollapsed && <span className="font-normal">Log Out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
