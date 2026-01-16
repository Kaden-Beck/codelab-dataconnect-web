import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { AuthContext } from '@/lib/firebase';
import { handleAuthStateChange } from '@/lib/MovieService';
import { Search, Film, User as UserIcon, LogOut, LogIn, History } from 'lucide-react';
import firebaseLogo from '@/assets/firebase_logo.svg';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const auth = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = handleAuthStateChange(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  async function handleSignIn() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  return (
    // "Next.js Style" Header: Sticky, Blur, Border-bottom
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 mx-auto">
        
        {/* Logo Section */}
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src={firebaseLogo} alt="Logo" className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block text-lg tracking-tight">
              FriendlyMovies
            </span>
          </Link>
          
          {/* Main Nav Links */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              to="/browse"
              className={`transition-colors hover:text-foreground/80 ${location.pathname === '/browse' ? 'text-foreground' : 'text-foreground/60'}`}
            >
              Browse
            </Link>
            <Link
              to="/search-fts"
              className={`transition-colors hover:text-foreground/80 ${location.pathname === '/search-fts' ? 'text-foreground' : 'text-foreground/60'}`}
            >
              Search
            </Link>
          </nav>
        </div>

        {/* Right Section: Search Icon & Auth */}
        <div className="flex items-center gap-2">
            <Link to="/search-fts">
                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                    <Search className="h-4 w-4" />
                </div>
            </Link>

          {user ? (
            <div className="flex items-center gap-4">
               {/* User Profile Link */}
               <Link 
                 to="/history" 
                 className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden lg:inline">History</span>
               </Link>

              <div className="flex items-center gap-2 border-l border-border pl-4">
                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                  {user.displayName?.split(' ')[0]}
                </span>
                
                {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full border border-border" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <UserIcon className="h-4 w-4" />
                    </div>
                )}

                <button
                  onClick={() => signOut(auth)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/10 hover:text-destructive h-9 w-9"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
