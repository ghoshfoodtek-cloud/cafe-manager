import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileNavigation, NavigationSection } from "@/hooks/useMobileNavigation";
import { 
  Home, 
  Users, 
  ShoppingCart, 
  Calendar, 
  PhoneCall 
} from "lucide-react";

const navigationSections: NavigationSection[] = [
  { id: 'dashboard', path: '/', title: 'Home', icon: Home },
  { id: 'clients', path: '/clients', title: 'Clients', icon: Users },
  { id: 'orders', path: '/orders', title: 'Orders', icon: ShoppingCart },
  { id: 'events', path: '/events', title: 'Events', icon: Calendar },
  { id: 'calls', path: '/calls', title: 'Calls', icon: PhoneCall },
];

export const BottomNavigation = () => {
  const isMobile = useIsMobile();
  const { currentSectionIndex, navigateToSection } = useMobileNavigation(navigationSections);

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationSections.map((section, index) => {
          const IconComponent = section.icon;
          const isActive = index === currentSectionIndex;
          
          return (
            <button
              key={section.id}
              onClick={() => navigateToSection(index)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-lg transition-colors",
                "min-w-0 px-1", // Ensure even spacing
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label={section.title}
            >
              <IconComponent className="h-5 w-5 shrink-0" />
              <span className="text-xs font-medium truncate w-full text-center">
                {section.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};