import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';

interface LocationPermissionModalProps {
  open: boolean;
  onRequestPermission: () => void;
}

export default function LocationPermissionModal({ open, onRequestPermission }: LocationPermissionModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Access Required
          </DialogTitle>
          <DialogDescription>
            BudDash needs access to your location to:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
              <p>Track your deliveries in real-time</p>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
              <p>Show customers accurate delivery ETAs</p>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
              <p>Calculate distances and optimize routes</p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Background Location Required
              </p>
              <p className="text-amber-800 dark:text-amber-200">
                Please select "Allow all the time" or "Always" when prompted to enable deliveries while the app is in the background.
              </p>
            </div>
          </div>

          <Button 
            onClick={onRequestPermission}
            className="w-full"
            size="lg"
          >
            Enable Location Access
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You cannot proceed without enabling location access
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
