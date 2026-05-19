"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { UPGRADE_TIERS, MAX_SLOTS } from "@/lib/upgrade-tiers";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal: any;
    appendHelcimPayIframe: (token: string) => void;
  }
}

export default function UpgradePage() {
  const router = useRouter();
  const [currentSlots, setCurrentSlots] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number | null>(null);
  const [method, setMethod] = useState<"paypal" | "helcim" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [helcimLoading, setHelcimLoading] = useState(false);
  const paypalRendered = useRef(false);

  // Fetch current slot count
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile }) => setCurrentSlots(profile?.slots_total ?? 28));
  }, []);

  // Reset payment method when tier changes
  function selectTier(slots: number) {
    if (slots === selectedSlots) return;
    setSelectedSlots(slots);
    setMethod(null);
    setError(null);
    paypalRendered.current = false;
  }

  function selectMethod(m: "paypal" | "helcim") {
    setMethod(m);
    setError(null);
    paypalRendered.current = false;
  }

  // PayPal
  useEffect(() => {
    if (method !== "paypal" || !selectedSlots) {
      paypalRendered.current = false;
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const existingScript = document.getElementById("paypal-sdk");

    const renderButtons = () => {
      if (paypalRendered.current) return;
      paypalRendered.current = true;

      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
          createOrder: async () => {
            setError(null);
            const res = await fetch("/api/payments/paypal/create-upgrade-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slots: selectedSlots }),
            });
            const data = await res.json();
            if (!res.ok || !data.id) {
              const msg = data.error || "Failed to create PayPal order";
              setError(msg);
              throw new Error(msg);
            }
            return data.id;
          },
          onApprove: async (data: { orderID: string }) => {
            setError(null);
            const res = await fetch("/api/payments/paypal/capture-upgrade-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID, slots: selectedSlots }),
            });
            const capture = await res.json();
            if (capture.status === "COMPLETED") {
              router.push(`/dashboard/upgrade/success?slots=${selectedSlots}`);
            } else {
              setError("Payment was not completed. Please try again.");
            }
          },
          onError: () => setError("PayPal encountered an error. Please try again."),
        })
        .render("#paypal-upgrade-container");
    };

    if (existingScript) {
      if (window.paypal) renderButtons();
      else existingScript.addEventListener("load", renderButtons);
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.addEventListener("load", renderButtons);
    document.head.appendChild(script);
  }, [method, selectedSlots, router]);

  // Helcim
  useEffect(() => {
    if (method !== "helcim" || !selectedSlots) return;

    let mounted = true;
    setHelcimLoading(true);
    setError(null);

    const init = async () => {
      try {
        const res = await fetch("/api/payments/helcim/init-upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slots: selectedSlots }),
        });
        const data = await res.json();

        if (!res.ok || !data.checkoutToken) {
          if (mounted) {
            setError(data.error || "Failed to initialize card payment");
            setHelcimLoading(false);
          }
          return;
        }

        const loadAndMount = () => {
          if (!mounted) return;
          setHelcimLoading(false);
          window.appendHelcimPayIframe(data.checkoutToken);
        };

        const existingScript = document.getElementById("helcim-pay-js");
        if (existingScript) { loadAndMount(); return; }

        const script = document.createElement("script");
        script.id = "helcim-pay-js";
        script.src = "https://secure.helcim.app/helcim-pay/services/start.js";
        script.addEventListener("load", loadAndMount);
        document.head.appendChild(script);
      } catch {
        if (mounted) {
          setError("Failed to initialize card payment");
          setHelcimLoading(false);
        }
      }
    };

    init();
    return () => { mounted = false; };
  }, [method, selectedSlots]);

  // Helcim postMessage
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.eventName !== "HELCIM_PAY_JS_WITH_SECURE_TOKEN") return;

      if (event.data.eventStatus === "SUCCESS") {
        setError(null);
        const res = await fetch("/api/payments/helcim/verify-upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: event.data.transactionId, slots: selectedSlots }),
        });
        const result = await res.json();
        if (result.success) {
          router.push(`/dashboard/upgrade/success?slots=${selectedSlots}`);
        } else {
          setError(result.error || "Payment verification failed");
        }
      } else {
        setError("Card payment failed. Please try again.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router, selectedSlots]);

  const selectedTier = UPGRADE_TIERS.find((t) => t.slots === selectedSlots);
  const newTotal = currentSlots != null && selectedSlots ? currentSlots + selectedSlots : null;

  return (
    <div className="pt-16 lg:pt-0 max-w-3xl">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-[#6B82A0] hover:text-[#C9A84C] transition-colors mb-6"
        >
          <ArrowLeft size={13} />
          Back to Dashboard
        </Link>
        <p className="text-xs tracking-[0.4em] text-[#C9A84C] uppercase mb-2">Expand Your Account</p>
        <h1 className="font-display text-3xl font-light text-[#EDE8DC]">Upgrade Memorial Slots</h1>
        <div className="gold-divider max-w-[200px] mt-4" />
      </div>

      {currentSlots != null && (
        <p className="text-xs text-[#6B82A0] mb-6">
          Current slots: <span className="text-[#EDE8DC]">{currentSlots}</span>
          {" · "}Maximum: <span className="text-[#EDE8DC]">{MAX_SLOTS}</span>
          {" · "}Available to add:{" "}
          <span className="text-[#C9A84C]">{MAX_SLOTS - currentSlots}</span>
        </p>
      )}

      {/* Tier selection */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {UPGRADE_TIERS.map((tier) => {
          const wouldExceed = currentSlots != null && currentSlots + tier.slots > MAX_SLOTS;
          const isSelected = selectedSlots === tier.slots;
          return (
            <button
              key={tier.slots}
              onClick={() => !wouldExceed && selectTier(tier.slots)}
              disabled={wouldExceed}
              className={`luxury-card p-5 text-left transition-all duration-200 ${
                wouldExceed
                  ? "opacity-40 cursor-not-allowed"
                  : isSelected
                  ? "border-[#C9A84C] bg-[#C9A84C]/5"
                  : "hover:border-[#C9A84C]/40 cursor-pointer"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs tracking-[0.3em] text-[#A09880] uppercase mb-1">
                    {tier.label}
                  </p>
                  <p className="font-display text-2xl text-[#C9A84C]">${tier.price}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "border-[#C9A84C]" : "border-[#3A4A5E]"
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
                </div>
              </div>
              <p className="text-sm text-[#EDE8DC] font-medium">{tier.description}</p>
              {wouldExceed && (
                <p className="text-[10px] text-[#3A4A5E] mt-1">Exceeds {MAX_SLOTS} slot limit</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Payment section — only shown after tier selected */}
      {selectedTier && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order summary */}
          <div className="luxury-card p-6">
            <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-5">Order Summary</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B82A0]">Package</span>
                <span className="text-[#EDE8DC]">{selectedTier.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B82A0]">Slots added</span>
                <span className="text-[#EDE8DC]">+{selectedTier.slots}</span>
              </div>
              {currentSlots != null && newTotal != null && (
                <div className="flex justify-between">
                  <span className="text-[#6B82A0]">New total</span>
                  <span className="text-[#EDE8DC]">{newTotal} slots</span>
                </div>
              )}
              <div className="border-t border-[#1E2A3D] pt-3 flex justify-between">
                <span className="text-[#A09880] uppercase tracking-wider text-xs">Total Due</span>
                <span className="font-display text-2xl text-[#C9A84C]">
                  ${selectedTier.price}.00
                </span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-4">
            <div className="luxury-card p-6">
              <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-5">
                Payment Method
              </p>

              <button
                onClick={() => selectMethod("paypal")}
                className={`w-full p-4 border text-left flex items-center gap-4 transition-all duration-200 mb-3 cursor-pointer ${
                  method === "paypal"
                    ? "border-[#C9A84C] bg-[#C9A84C]/5"
                    : "border-[#1E2A3D] hover:border-[#C9A84C]/40"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  method === "paypal" ? "border-[#C9A84C]" : "border-[#3A3A3A]"
                }`}>
                  {method === "paypal" && <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
                </div>
                <div>
                  <p className="text-sm text-[#EDE8DC] font-medium">PayPal</p>
                  <p className="text-xs text-[#6B82A0]">Pay with your PayPal account</p>
                </div>
              </button>

              <button
                onClick={() => selectMethod("helcim")}
                className={`w-full p-4 border text-left flex items-center gap-4 transition-all duration-200 cursor-pointer ${
                  method === "helcim"
                    ? "border-[#C9A84C] bg-[#C9A84C]/5"
                    : "border-[#1E2A3D] hover:border-[#C9A84C]/40"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  method === "helcim" ? "border-[#C9A84C]" : "border-[#3A3A3A]"
                }`}>
                  {method === "helcim" && <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />}
                </div>
                <div>
                  <p className="text-sm text-[#EDE8DC] font-medium">Credit / Debit Card</p>
                  <p className="text-xs text-[#6B82A0]">Visa, Mastercard, Amex</p>
                </div>
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
                {error}
              </div>
            )}

            {method === "helcim" && (
              <div className="luxury-card p-6">
                <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-5">Card Details</p>
                {helcimLoading ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <p className="text-xs text-[#6B82A0]">Loading secure payment form...</p>
                  </div>
                ) : (
                  <div id="helcim-pay-container" className="min-h-[200px]" />
                )}
              </div>
            )}

            {method === "paypal" && (
              <div className="luxury-card p-6">
                <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-5">PayPal Checkout</p>
                <div id="paypal-upgrade-container" className="min-h-[60px]" />
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedTier && currentSlots != null && currentSlots >= MAX_SLOTS && (
        <div className="luxury-card p-8 text-center">
          <Zap size={24} className="text-[#C9A84C] mx-auto mb-3" />
          <p className="text-sm text-[#EDE8DC] mb-1">You've reached the maximum slot limit</p>
          <p className="text-xs text-[#6B82A0]">
            Your account holds the maximum of {MAX_SLOTS} memorial slots.
          </p>
        </div>
      )}
    </div>
  );
}
