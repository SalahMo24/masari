import { useEffect } from "react";
import { router } from "expo-router";

export default function NewTransactionTab() {
  useEffect(() => {
    router.replace("/(features)/transactions/new");
  }, []);

  return null;
}
