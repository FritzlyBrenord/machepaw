"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthenticated } = useUser();

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          firstName: session.user.user_metadata?.first_name || "",
          lastName: session.user.user_metadata?.last_name || "",
          avatar: session.user.user_metadata?.avatar_url || "",
          addresses: session.user.user_metadata?.addresses || [],
          wishlist: [],
          orders: [],
          createdAt: session.user.created_at,
        });
        setAuthenticated(true);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          firstName: session.user.user_metadata?.first_name || "",
          lastName: session.user.user_metadata?.last_name || "",
          avatar: session.user.user_metadata?.avatar_url || "",
          addresses: session.user.user_metadata?.addresses || [],
          wishlist: [],
          orders: [],
          createdAt: session.user.created_at,
        });
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setAuthenticated]);

  return <>{children}</>;
}
