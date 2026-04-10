import { useTheme } from "@/components/ThemeProvider";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      offset="80px"
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "!bg-[rgba(10,10,12,0.88)] !backdrop-blur-xl",
            "!border-l-2 !border-l-[hsl(var(--gold))] !border-t-[hsl(var(--gold)/0.15)] !border-r-[hsl(var(--gold)/0.15)] !border-b-[hsl(var(--gold)/0.15)]",
            "!text-white !shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_0.5px_hsl(var(--gold)/0.2)]",
            "!rounded-xl",
          ].join(" "),
          title: "!text-white !font-medium",
          description: "!text-white/60 !text-sm",
          success: "!text-[hsl(var(--gold))]",
          error: "!text-red-400",
          warning: "!text-amber-400",
          info: "!text-blue-400",
          icon: "[&>svg]:!text-[hsl(var(--gold))] [&>svg]:!stroke-[hsl(var(--gold))]",
          actionButton: "!bg-[hsl(var(--gold))] !text-black !font-semibold hover:!opacity-90",
          cancelButton: "!bg-white/10 !text-white/70 hover:!bg-white/20",
          closeButton: "!bg-white/10 !text-white/60 hover:!bg-white/20 hover:!text-white !border-white/10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
