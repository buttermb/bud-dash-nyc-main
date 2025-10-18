interface NYMLogoProps {
  size?: number;
  className?: string;
}

const NYMLogo = ({ size = 50, className = "" }: NYMLogoProps) => {
  return (
    <div 
      className={`relative flex items-center justify-center rounded-full bg-gradient-primary border border-primary/40 shadow-elegant transition-all duration-300 hover:scale-105 hover:shadow-glow ${className}`}
      style={{ 
        width: size, 
        height: size 
      }}
    >
      <span 
        className="font-black text-primary-foreground tracking-wider select-none"
        style={{ 
          fontSize: size * 0.35,
        }}
      >
        NYM
      </span>
    </div>
  );
};

export default NYMLogo;
