import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/lib/firebase"; // Your existing firebase context
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { 
  Film, 
  History, 
  Sparkles, 
  Search, 
  LogOut, 
  User as UserIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function Header({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  
  // Use the Context you set up in previous Vite steps
  const auth = useContext(AuthContext);
  const user = auth.currentUser;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?title=${encodeURIComponent(query)}`);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            FriendlyMovies
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild>
              <Link to="/browse"><Film className="mr-2 h-4 w-4"/> Browse</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/history"><History className="mr-2 h-4 w-4"/> My Watches</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/recommender"><Sparkles className="mr-2 h-4 w-4"/> AI Suggest</Link>
            </Button>
          </nav>
        </div>

        {/* Right: Search, Theme, User */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movies..."
              className="w-[200px] pl-9 md:w-[260px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <ThemeToggle />

          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                    <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end" forceMount>
                <div className="grid gap-2">
                  <div className="font-medium text-sm leading-none">{user.displayName}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="h-px bg-border my-1" />
                  <Button variant="ghost" className="w-full justify-start text-red-500" onClick={() => signOut(auth)}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button onClick={handleLogin} size="sm">Sign In</Button>
          )}
        </div>
      </div>
    </header>
  );
}
