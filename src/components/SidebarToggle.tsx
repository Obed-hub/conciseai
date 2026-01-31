import { Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

const SidebarToggle = () => {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className={`
        flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 press-effect
        bg-background shadow-[4px_4px_8px_hsl(220_20%_85%),-4px_-4px_8px_hsl(0_0%_100%)] text-muted-foreground hover:text-foreground
        dark:bg-[hsl(0_0%_100%/0.06)] dark:border dark:border-[hsl(0_0%_100%/0.1)] dark:shadow-none
        dark:hover:bg-[hsl(0_0%_100%/0.1)]
        ${isMobile ? '' : 'md:hidden'}
      `}
      aria-label="Toggle sidebar"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
};

export default SidebarToggle;
