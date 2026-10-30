"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "@/shared/toast";
import { lookupRegistryAction } from "@/features/registry/api/registry";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { isValidIco } from "@/shared/lib/validations/sk";
import type { RegistryCompany } from "@/shared/api/types";

function normalizeCountry(country: string | null | undefined): "SK" | "CZ" | null {
  const code = (country ?? "").trim().toUpperCase();
  if (code === "SK" || code === "CZ") return code;
  return null;
}

export type RegistryLookupMessages = {
  needIco: string;
  filledRpo: string;
  filledAres: string;
};

export function useRegistryLookup(opts: {
  ico: string | null | undefined;
  country: string | null | undefined;
  onFound: (data: RegistryCompany) => void;
  messages?: RegistryLookupMessages;
}) {
  const [pending, startTransition] = useTransition();
  const [lookingUp, setLookingUp] = useState(false);
  const lastKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const onFoundRef = useRef(opts.onFound);
  const icoRef = useRef(opts.ico);
  const countryRef = useRef(opts.country);
  const messagesRef = useRef(opts.messages);

  useEffect(() => {
    onFoundRef.current = opts.onFound;
  }, [opts.onFound]);

  useEffect(() => {
    icoRef.current = opts.ico;
    countryRef.current = opts.country;
  }, [opts.ico, opts.country]);

  useEffect(() => {
    messagesRef.current = opts.messages;
  }, [opts.messages]);

  const registryCountry = normalizeCountry(opts.country);
  const ico = (opts.ico ?? "").trim();
  const canLookup = Boolean(registryCountry && isValidIco(ico));

  const lookup = useCallback((mode: "auto" | "manual" = "manual") => {
    const country = normalizeCountry(countryRef.current);
    const value = (icoRef.current ?? "").trim();
    const messages = messagesRef.current;
    if (!country || !isValidIco(value)) {
      if (mode === "manual") {
        toast.error(
          !country
            ? "Doplnenie z registra je pre SK a CZ."
            : (messages?.needIco ?? "Zadaj platné 8-miestne IČO."),
        );
      }
      return;
    }

    const key = `${country}:${value}`;
    if (mode === "auto" && lastKeyRef.current === key) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setLookingUp(true);
    startTransition(async () => {
      try {
        const result = await lookupRegistryAction({ country, ico: value });
        if (!result?.data) {
          toast.error(
            actionErrorMessage(result ?? {}) ?? "Doplnenie z registra zlyhalo",
          );
          return;
        }
        lastKeyRef.current = key;
        onFoundRef.current(result.data);
        toast.success(
          country === "CZ"
            ? (messages?.filledAres ?? "Údaje doplnené z ARES")
            : (messages?.filledRpo ?? "Údaje doplnené z RPO"),
        );
      } finally {
        inFlightRef.current = false;
        setLookingUp(false);
      }
    });
  }, []);

  return {
    canLookup,
    lookingUp: lookingUp || pending,
    registrySupported: registryCountry !== null,
    lookup,
  };
}
