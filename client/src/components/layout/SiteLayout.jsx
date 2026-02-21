import { useState } from "react";
import LayoutShell from "./LayoutShell";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ContactModal from "../modals/ContactModal";
import Toast from "../Toast";
import useToast from "../../hooks/useToast";

export default function SiteLayout({ children, showFooter = true }) {
  const [contactOpen, setContactOpen] = useState(false);
  const [toastMessage, showToast] = useToast();

  return (
    <LayoutShell>
      <div className="flex min-h-screen flex-col">
        <Navbar onOpenContact={() => setContactOpen(true)} />
        <main className="w-full py-6 sm:py-8">{children}</main>
        {showFooter ? <Footer onOpenContact={() => setContactOpen(true)} /> : null}
      </div>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} onSuccess={showToast} />
      <Toast message={toastMessage} />
    </LayoutShell>
  );
}
