'use client';

import httpClient from "@/lib/httpClient";
import URLHelper from "@/lib/urlHelper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const OTL = ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const router = useRouter();
  const [isProgress, setIsProgress] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async () => {
    const { slug } = await params;
    const json = await httpClient.get(`${URLHelper.otl}/login/${slug}`);
    if (json.status == 'success') {
      // console.log(json);
      router.push('/home');
    } else {
      setIsProgress(false);
      setErrorMsg(json.msg);
    }
  }

  return (
    <>{isProgress ? <div>Loading...</div> : <div>{errorMsg}</div>}</>
  );
};

export default OTL;
