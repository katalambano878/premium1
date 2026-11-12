"use client";

import { Printer } from "lucide-react";
import { buttonClass } from "../ui";

/** Opens the browser's print dialog, where the invoice can also be saved as a PDF. */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("secondary")}>
      <Printer size={16} aria-hidden /> Print / save PDF
    </button>
  );
}
