import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground" aria-label="Copy message">
      {copied ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
