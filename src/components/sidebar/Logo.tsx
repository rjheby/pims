
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/">
      <img 
        src="/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png"
        alt="Woodbourne Logo"
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}
