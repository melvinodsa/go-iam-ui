import { useResourceState } from "@/hooks/resources";
import { useEffect } from "react";
import { toast } from "sonner"


const AppError = () => {
  const resourceState = useResourceState();
  useEffect(() => {
    const myPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        resourceState.resetError();
        resolve();
      }, 3000);
    });
    const err = resourceState.err;

    ;
  }, [resourceState.err, resourceState.resetError]);
  return (<></>);
}

export default AppError;