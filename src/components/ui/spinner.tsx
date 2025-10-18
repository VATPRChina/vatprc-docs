import { cn } from "@/lib/utils";
import { TbLoader } from "react-icons/tb";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return <TbLoader className={cn(className, "m-auto h-24 animate-spin")} size={48} {...props} />;
}

export { Spinner };
