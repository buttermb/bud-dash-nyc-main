interface NYMLogoProps {
  size?: number;
  className?: string;
}

const NYMLogo = ({ size = 50, className = "" }: NYMLogoProps) => {
  return (
    <div 
      className={`relative flex items-center justify-center rounded-full bg-gradient-vibrant border-2 border-primary shadow-glow transition-all duration-300 hover:scale-110 hover:shadow-neon ${className}`}
      style={{ 
        width: size, 
        height: size 
      }}
    >
      <span 
        className="font-black text-black tracking-wider select-none"
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
