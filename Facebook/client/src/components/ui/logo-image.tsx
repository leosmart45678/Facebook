export function LogoImage({ 
  src, 
  alt = "Logo",
  className 
}: { 
  src: string; 
  alt?: string;
  className?: string;
}) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className || "w-[60px] h-[60px] block mx-auto"}
    />
  );
}