"use client";

import { useEffect, useState, type ReactNode } from "react";
import Loader3DCircle from "@/components/loader-3d-circle";

type RootTemplateProps = {
  children: ReactNode;
};

export default function RootTemplate({ children }: RootTemplateProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <Loader3DCircle message="Loading..." />;
  }

  return <>{children}</>;
}
