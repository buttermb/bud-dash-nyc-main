import nymLogo from "@/assets/nym-logo.svg";

interface NYMLogoProps {
  size?: number;
  className?: string;
}

const NYMLogo = ({ size = 50, className = "" }: NYMLogoProps) => {
  return (
    <img 
      src={nymLogo} 
      alt="NYM Logo" 
      width={size} 
      height={size}
      className={className}
    />
  );
};

export default NYMLogo;
