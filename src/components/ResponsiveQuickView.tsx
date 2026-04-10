import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface ResponsiveQuickViewProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  desktopClassName?: string;
}

/**
 * Renders a centered Dialog on desktop and a bottom Drawer on mobile.
 * Children receive the content area — skip DialogContent/DrawerContent yourself.
 */
export default function ResponsiveQuickView({
  open,
  onClose,
  title,
  children,
  desktopClassName = "sm:max-w-2xl",
}: ResponsiveQuickViewProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent className="max-h-[85vh]">
          {title && (
            <DrawerHeader className="pb-2">
              <DrawerTitle className="font-serif text-xl">{title}</DrawerTitle>
            </DrawerHeader>
          )}
          <div className="overflow-y-auto px-4 pb-6">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`border-0 bg-transparent shadow-none p-0 ${desktopClassName} max-h-[90vh] overflow-hidden`}>
        {/* Visually hidden title for a11y when no visible title */}
        {!title && <DialogTitle className="sr-only">Quick View</DialogTitle>}
        {title && (
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
