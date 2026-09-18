import { downloadDocument } from "@/lib/api";
import { Button } from "@/shared/ui";
import { useMutation } from "@tanstack/react-query";
export function DocumentDownload({
  id,
  name,
  label = "Download",
}: {
  id: string;
  name: string;
  label?: string;
}) {
  const download = useMutation({
    mutationFn: () => downloadDocument(id, name),
  });
  return (
    <>
      <Button
        variant="ghost"
        disabled={download.isPending}
        onClick={() => download.mutate()}
      >
        {label}
      </Button>
      {download.error && <p role="alert">{download.error.message}</p>}
    </>
  );
}
