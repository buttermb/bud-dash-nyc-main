import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FloatingCartButtonProps {
  itemCount: number;
  onClick: () => void;
  className?: string;
}

export default function FloatingCartButton({ itemCount, onClick, className }: FloatingCartButtonProps) {
  if (itemCount === 0) return null;

  return (
    <Button
      onClick={onClick}
      size="lg"
      variant="hero"
      className={cn(
        "fixed bottom-24 right-6 z-50 h-16 w-16 rounded-full shadow-2xl",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
        "hover:scale-110 transition-transform",
        className
      )}
    >
      <ShoppingCart className="h-6 w-6" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
      >
        {itemCount}
      </Badge>
    </Button>
  );
}
