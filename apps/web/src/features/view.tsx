import { ApiError } from "@/lib/api";
import { Card } from "@/shared/ui";
import { useQuery } from "@tanstack/react-query";
export const tone = (value: string) =>
  value.includes("REJECT") || value.includes("FAILED")
    ? ("red" as const)
    : value.includes("OPEN") ||
        value.includes("APPROVED") ||
        value.includes("ACCEPTED") ||
        value.includes("AVAILABLE")
      ? ("green" as const)
      : ("amber" as const);
export function ErrorMessage({ error }: { error: unknown }) {
  return (
    <p className="notice" role="alert">
      {error instanceof ApiError
        ? error.message
        : "Không thể tải dữ liệu. Vui lòng thử lại."}
    </p>
  );
}
export function Loading() {
  return (
    <Card>
      <p className="subtle">Đang tải…</p>
    </Card>
  );
}
export function useData<T>(key: unknown[], fn: () => Promise<T>) {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    retry: (count, error) =>
      !(error instanceof ApiError && [401, 403, 404].includes(error.status)) &&
      count < 1,
  });
}
export function split(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
export function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
export function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "—";
}
export function sum(value: unknown) {
  return value && typeof value === "object"
    ? Object.values(value as Record<string, unknown>).reduce<number>(
        (total, item) => total + (typeof item === "number" ? item : 0),
        0,
      )
    : 0;
}
export function validateFile(file: File) {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (file.size > 10 * 1024 * 1024)
    throw new Error("File must be 10 MiB or smaller");
  if (file.type && !allowed.includes(file.type))
    throw new Error("Only PDF, JPEG, PNG, and DOCX files are allowed");
}
