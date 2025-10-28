"use client";

import { useState, useEffect } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function ReactQueryDevtoolsWrapper() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const [showDevtools, setShowDevtools] = useState(false);

  useEffect(() => {
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools((old) => !old);

    return () => {
      // @ts-ignore
      delete window.toggleDevtools;
    };
  }, []);

  return showDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null;
}
