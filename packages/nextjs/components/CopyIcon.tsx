import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { TiTick } from "react-icons/ti";
import { toast } from "sonner";

const CopyIcon = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div>
      {isCopied ? (
        <TiTick
          onClick={() => {
            setIsCopied(false);
          }}
          className="cursor-pointer"
        />
      ) : (
        <LuCopy
          onClick={() => {
            navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => {
              setIsCopied(false);
            }, 5000);
          }}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default CopyIcon;
