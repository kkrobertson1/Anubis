"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal: any;
    appendHelcimPayIframe: (token: string) => void;
  }
}

const FEATURES = [
  "28 dedicated memorial slots",
  "Photo & obituary uploads",
  "Gravesite navigation (lat/long)",
  "Virtual guest book on each profile",
  "Location match notifications",
  "Community connection network",
  "Lifetime access — no subscriptions",
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [method, setMethod] = useState<"paypal" | "helcim" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [helcimLoading, setHelcimLoading] = useState(false);
  const paypalRendered = useRef(false);

  // PayPal: load SDK and render buttons when method is selected
  useEffect(() => {
    if (method !== "paypal") {
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
            const res = await fetch("/api/payments/paypal/create-order", {
              method: "POST",
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
            const res = await fetch("/api/payments/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const capture = await res.json();
            if (capture.status === "COMPLETED") {
              router.push("/checkout/success");
            } else {
              setError("Payment was not completed. Please try again.");
            }
          },
          onError: () => {
            setError("PayPal encountered an error. Please try again.");
          },
        })
        .render("#paypal-button-container");
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
  }, [method, router]);

  // Helcim: fetch checkout token and mount HelcimPay.js iframe
  useEffect(() => {
    if (method !== "helcim") return;

    let mounted = true;
    setHelcimLoading(true);
    setError(null);

    const initHelcim = async () => {
      try {
        const res = await fetch("/api/payments/helcim/init", { method: "POST" });
        const data = await res.json();

        if (!res.ok || !data.checkoutToken) {
          if (mounted) {
            setError(data.error || "Failed to initialize card payment");
            setHelcimLoading(false);
          }
          return;
        }

        const checkoutToken = data.checkoutToken;

        const loadAndMount = () => {
          if (!mounted) return;
          setHelcimLoading(false);
          window.appendHelcimPayIframe(checkoutToken);
        };

        const existingScript = document.getElementById("helcim-pay-js");
        if (existingScript) {
          loadAndMount();
          return;
        }

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

    initHelcim();
    return () => { mounted = false; };
  }, [method]);

  // Listen for Helcim payment result via postMessage
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.eventName !== "HELCIM_PAY_JS_WITH_SECURE_TOKEN") return;

      if (event.data.eventStatus === "SUCCESS") {
        setError(null);
        const res = await fetch("/api/payments/helcim/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: event.data.transactionId }),
        });
        const result = await res.json();
        if (result.success) {
          router.push("/checkout/success");
        } else {
          setError(result.error || "Payment verification failed");
        }
      } else {
        setError("Card payment failed. Please try again.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0A0F1A] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-8">
            <Image src="/logo.png" alt="ANUBIS" width={46} height={15} className="object-contain" />
            <span className="font-display text-2xl font-light tracking-[0.2em] text-[#C9A84C]">ANUBIS</span>
          </Link>
          <p className="text-xs tracking-[0.5em] text-[#C9A84C] uppercase mb-3">Final Step</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[#EDE8DC] mb-4">
            Complete Your Account
          </h1>
          <div className="gold-divider max-w-xs mx-auto" />
        </div>

        {reason === "unpaid" && (
          <div className="mb-8 px-5 py-4 bg-amber-900/20 border border-amber-700/40 text-amber-300 text-sm text-center">
            Your account is pending activation. If you believe this is an error, please{" "}
            <a href="mailto:support@anubiskemet2.com" className="underline hover:text-amber-200 transition-colors">
              contact support
            </a>.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="luxury-card p-8">
            <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-6">Order Summary</p>

            <div className="flex items-end justify-between mb-6 pb-6 border-b border-[#1E2A3D]">
              <div>
                <p className="font-display text-xl text-[#EDE8DC] mb-1">Memorial Account</p>
                <p className="text-xs text-[#6B82A0]">One-time payment · Lifetime access</p>
              </div>
              <p className="font-display text-3xl text-[#C9A84C]">$35</p>
            </div>

            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="text-[#C9A84C] text-xs mt-0.5 flex-shrink-0">✦</span>
                  <span className="text-sm text-[#A09880]">{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-6 border-t border-[#1E2A3D]">
              <span className="text-sm text-[#A09880] tracking-wider uppercase">Total Due</span>
              <span className="font-display text-3xl text-[#C9A84C]">$35.00</span>
            </div>
          </div>

          {/* Payment */}
          <div className="flex flex-col gap-6">
            <div className="luxury-card p-8">
              <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-6">
                Select Payment Method
              </p>

              {/* PayPal option */}
              <button
                onClick={() => { setMethod("paypal"); setError(null); }}
                className={`w-full p-4 border text-left flex items-center gap-4 transition-all duration-200 mb-4 cursor-pointer ${
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
                  <p className="text-xs text-[#6B82A0]">Pay securely with your PayPal account</p>
                </div>
                <svg className="ml-auto w-16 h-auto opacity-60" viewBox="0 0 100 32" fill="none">
                  <text x="0" y="24" fontSize="22" fontWeight="bold" fill="#009CDE">Pay</text>
                  <text x="32" y="24" fontSize="22" fontWeight="bold" fill="#003087">Pal</text>
                </svg>
              </button>

              {/* Helcim option */}
              <button
                onClick={() => { setMethod("helcim"); setError(null); }}
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
                  <p className="text-xs text-[#6B82A0]">Powered by Helcim · Visa, Mastercard, Amex</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {["VISA", "MC", "AMEX"].map((card) => (
                    <span key={card} className="text-[10px] text-[#6B82A0] border border-[#1E2A3D] px-1 py-0.5">
                      {card}
                    </span>
                  ))}
                </div>
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="px-4 py-3 bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Helcim card form */}
            {method === "helcim" && (
              <div className="luxury-card p-8">
                <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-6">Card Details</p>
                {helcimLoading ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <p className="text-xs text-[#6B82A0]">Loading secure payment form...</p>
                  </div>
                ) : (
                  <div id="helcim-pay-container" className="min-h-[200px]" />
                )}
              </div>
            )}

            {/* PayPal buttons */}
            {method === "paypal" && (
              <div className="luxury-card p-8">
                <p className="text-xs tracking-[0.4em] text-[#A09880] uppercase mb-6">PayPal Checkout</p>
                <div id="paypal-button-container" className="min-h-[60px]" />
              </div>
            )}

            {/* Placeholder when no method selected */}
            {!method && (
              <button
                disabled
                className="w-full py-4 bg-[#C9A84C] text-[#0D0D0D] text-sm tracking-widest uppercase font-medium disabled:opacity-30 disabled:cursor-not-allowed gold-glow"
              >
                Select a Payment Method
              </button>
            )}

            <p className="text-xs text-[#6B82A0] text-center leading-relaxed">
              Your payment is secured and encrypted. By completing this purchase you agree to our{" "}
              <Link href="/terms" className="text-[#6B82A0] hover:text-[#C9A84C] transition-colors">
                Terms of Service
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
