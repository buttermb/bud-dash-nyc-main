import { memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  onError?: () => void;
}

const OptimizedImage = memo(({
  src,
  alt,
  className,
  loading = 'lazy',
  width,
  height,
  onError
}: OptimizedImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      width={width}
      height={height}
      decoding="async"
      className={cn('object-cover', className)}
      onError={onError}
      style={{
        contentVisibility: 'auto',
      }}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
