import { useState, useEffect, useContext } from "react";
import { User } from "firebase/auth";
import { AuthContext } from "@/lib/firebase";
import { handleAuthStateChange } from "@/lib/MovieService";

export function useUser() {
  const auth = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = handleAuthStateChange(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
