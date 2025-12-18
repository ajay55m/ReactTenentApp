import React, { useEffect, useState } from "react";
import Dashboard from "../Dashboard";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate API call
    setTimeout(() => {
      setLoading(false); // show real dashboard after 2 sec
    }, 2000);
  }, []);

  return <Dashboard loading={loading} />;
}
