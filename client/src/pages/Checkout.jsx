import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import useCart from "../hooks/useCart";
import { buildCartLines, calcTotals } from "../lib/cart";
import { formatPrice } from "../lib/format";
import { fetchProducts } from "../lib/productsApi";
import { CART_STORAGE_KEY } from "../lib/storage";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");
const checkoutCurrency = String(import.meta.env.VITE_STRIPE_CURRENCY || "usd").toLowerCase();

function CheckoutForm({ onPaymentSuccess }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout`
      }
    });

    if (result.error) {
      setError(result.error.message || t("checkout.createIntentError"));
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onPaymentSuccess();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <PaymentElement />
      {error ? <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{error}</p> : null}
      <Button className="w-full" disabled={!stripe || submitting} type="submit" variant="primary">
        {submitting ? t("checkout.processing") : t("checkout.payNow")}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const { cart, clearCart } = useCart(CART_STORAGE_KEY);
  const [catalog, setCatalog] = useState([]);
  const [clientSecret, setClientSecret] = useState("");
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [toastMessage, showToast] = useToast();

  useEffect(() => {
    document.title = t("meta.checkout");
  }, [t, i18n.language]);

  useEffect(() => {
    let active = true;
    fetchProducts().then((result) => {
      if (!active) return;
      setCatalog(result.products);
    });

    return () => {
      active = false;
    };
  }, []);

  const cartLines = useMemo(() => buildCartLines(cart, catalog), [cart, catalog]);
  const totals = useMemo(() => calcTotals(cartLines), [cartLines]);

  useEffect(() => {
    let active = true;
    const amount = Math.round(Number(totals.total || 0) * 100);
    if (amount <= 0) {
      setClientSecret("");
      return;
    }

    setInitializingPayment(true);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: checkoutCurrency,
        metadata: { source: "perfect-store" }
      })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || t("checkout.createIntentError"));
        return data;
      })
      .then((data) => {
        if (!active) return;
        setClientSecret(data.clientSecret || "");
      })
      .catch((error) => {
        if (!active) return;
        setClientSecret("");
        showToast(error.message || t("checkout.createIntentError"));
      })
      .finally(() => {
        if (active) setInitializingPayment(false);
      });

    return () => {
      active = false;
    };
  }, [totals.total, t]);

  function handlePaymentSuccess() {
    clearCart();
    showToast(t("checkout.success"));
  }

  return (
    <SiteLayout>
      <Container className="space-y-6">
        <section className="surface-card p-5 sm:p-6">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t("checkout.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("checkout.subtitle")}</p>
        </section>

        {cartLines.length === 0 ? (
          <section className="surface-card p-8 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("checkout.empty")}</p>
            <Button className="mt-4" to="/products" variant="secondary">
              {t("checkout.goShop")}
            </Button>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <article className="surface-card p-5">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">{t("checkout.summary")}</h2>
              <div className="space-y-3">
                {cartLines.map((line) => (
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700" key={line.id}>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{line.product.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {line.qty} × {formatPrice(line.product.price, i18n.language)} {t("common.currency")}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatPrice(line.product.price * line.qty, i18n.language)} {t("common.currency")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotal, i18n.language)} {t("common.currency")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(totals.shipping, i18n.language)} {t("common.currency")}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                  <span>Total</span>
                  <span>{formatPrice(totals.total, i18n.language)} {t("common.currency")}</span>
                </div>
              </div>
            </article>

            <article className="surface-card p-5">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">{t("checkout.cardTitle")}</h2>
              {initializingPayment ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("common.loading")}</p>
              ) : clientSecret ? (
                <Elements options={{ clientSecret }} stripe={stripePromise}>
                  <CheckoutForm onPaymentSuccess={handlePaymentSuccess} />
                </Elements>
              ) : (
                <p className="text-sm text-rose-600 dark:text-rose-300">{t("checkout.createIntentError")}</p>
              )}
            </article>
          </section>
        )}
      </Container>

      <Toast message={toastMessage} />
    </SiteLayout>
  );
}
