"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/format-phone";

type PhoneInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> & {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
};

/**
 * Extract local digits (no country code) from any phone value.
 */
function toLocalDigits(raw: string): string {
  const d = raw.replace(/\D/g, "");
  // If it starts with "1" and has 11+ digits, strip country code
  if (d.startsWith("1") && d.length >= 11) return d.slice(1, 11);
  return d.slice(0, 10);
}

/**
 * Format local digits (max 10) into +1 (XXX) XXX-XXXX
 */
function formatLocal(local: string): string {
  if (local.length === 0) return "";
  if (local.length <= 3) return `+1 (${local}`;
  if (local.length <= 6) return `+1 (${local.slice(0, 3)}) ${local.slice(3)}`;
  return `+1 (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ value, onChange, onBlur, name, ...props }, ref) {
    // Track only the local digits (no country code), max 10
    const [localDigits, setLocalDigits] = React.useState(() =>
      value ? toLocalDigits(value) : ""
    );

    const display = formatLocal(localDigits);

    // Sync on external value change (e.g. form reset)
    const prevValueRef = React.useRef(value);
    React.useEffect(() => {
      if (value !== prevValueRef.current) {
        prevValueRef.current = value;
        setLocalDigits(value ? toLocalDigits(value) : "");
      }
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const rawInput = e.target.value;
      const allDigits = rawInput.replace(/\D/g, "");

      // When the display is showing "+1 (...)", the extracted digits include
      // the "1" from the country code prefix. Strip it.
      let newLocal: string;
      if (display) {
        // "+1" was visible, so leading "1" is the country code — remove it
        newLocal = allDigits.startsWith("1") ? allDigits.slice(1) : allDigits;
      } else {
        // Field was empty — all digits are user input
        newLocal = allDigits;
      }

      newLocal = newLocal.slice(0, 10);
      setLocalDigits(newLocal);

      const formatted = formatLocal(newLocal);

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: formatted, name: e.target.name || name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+1 (809) 000-0000"
        value={display}
        onChange={handleChange}
        onBlur={onBlur}
        name={name}
        {...props}
      />
    );
  }
);

export { PhoneInput, formatPhone };
