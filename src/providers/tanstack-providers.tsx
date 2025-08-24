"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const SessionUpdateListener = () => {
  const { data: session, update } = useSession();
  
  // useEffect(() => {
  //   const handleSessionUpdate = (event: Event) => {
  //     const customEvent = event as CustomEvent<SessionUpdateEventDetail>;
  //     const { accessToken } = customEvent.detail;
      
  //     console.log("Updating session with new access token");
      
  //     update({
  //       ...session,
  //       accessToken,
  //     });
  //   };
    
  //   window.addEventListener("session-update", handleSessionUpdate);
    
  //   return () => {
  //     window.removeEventListener("session-update", handleSessionUpdate);
  //   };
  // }, [session, update]);
  
  return null;
};

interface TanstackProvidersProps {
  children: React.ReactNode;
}

export const TanstackProviders = ({ children }: TanstackProvidersProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <SessionUpdateListener />
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
};
