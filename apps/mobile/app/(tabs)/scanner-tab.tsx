import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function ScannerTabPlaceholder() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/scanner");
  }, []);

  return null;
}
