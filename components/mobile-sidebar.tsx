import { Sidebar } from "@/components/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="left" className="p-0 w-80">
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}
