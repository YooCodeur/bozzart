"use client";

interface ReadReceiptProps {
  status: "sent" | "delivered" | "read";
}

export function ReadReceipt({ status }: ReadReceiptProps) {
  if (status === "read") {
    return (
      <span className="text-blue-400" title="Lu">
        <svg className="inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M2 13l4 4L14 7" /><path d="M9 13l4 4L21 7" />
        </svg>
      </span>
    );
  }

  if (status === "delivered") {
    return (
      <span className="text-gray-400" title="Delivre">
        <svg className="inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M2 13l4 4L14 7" /><path d="M9 13l4 4L21 7" />
        </svg>
      </span>
    );
  }

  return (
    <span className="text-gray-300" title="Envoye">
      <svg className="inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}
