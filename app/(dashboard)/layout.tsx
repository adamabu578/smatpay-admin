'use client';

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import httpClient from "@/lib/httpClient";
import useStore from "@/lib/stateStore";
import URLHelper from "@/lib/urlHelper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isProfiling, ] = useState(true);
  const [profile, setProfile] = useState();
  const setStoreProfile = useStore(state => state.setProfile);
  // const setBalance = useStore(state => state.setBalance);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    const json = await httpClient.get(URLHelper.profile);
    if (json.status == 'success') {
      // console.log(json);
      setStoreProfile(json.data);
      setProfile(json.data);
    } else {
      router.push('/');
    }
  }

  if (!profile && isProfiling) {
    return <p>Loading...</p>
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} /> */}
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
