import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import httpClient from "./httpClient";
import URLHelper from "./urlHelper";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handelLogOut = async (router: AppRouterInstance) => {
  const json = await httpClient.get(URLHelper.logout);
  if (json.status == 'success') {
    // window.location.href = `/`;
    router.push('/');
  }
};

export const formatTime = (time: string) => {
  return new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(time));
}

export const formatCurrency = (number: number) => {
  const result = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    // currencyDisplay: hideCurrency ? "code" : 'symbol',
  })
    .format(number);
  // if (hideCurrency) {
  //     result.replace("NGN", "")
  // }
  return result.trim();
}

// export const valFromUrlQueryString = (params, key) => {
//   const arr = params.search.replace('?', '')?.split('&')?.filter(i => i?.split('=')[0] == key);
//   return arr[0]?.split('=')[1];
// }
