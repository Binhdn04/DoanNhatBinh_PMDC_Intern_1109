import { Button } from "@/shared/ui";
export function Pagination({
  page,
  count,
  busy,
  onChange,
}: {
  page: number;
  count: number;
  busy: boolean;
  onChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="form-actions">
      <Button disabled={page === 1 || busy} onClick={() => onChange(page - 1)}>
        Previous page
      </Button>
      <span>Page {page}</span>
      <Button disabled={count < 20 || busy} onClick={() => onChange(page + 1)}>
        Next page
      </Button>
    </nav>
  );
}
