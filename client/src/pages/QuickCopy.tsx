import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import QuickCopyDialog from "@/components/QuickCopyDialog";

export default function QuickCopy() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(true);

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        setLocation("/dashboard");
      }
    } else {
      setOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pl-20">
      <Header />
      <Sidebar />
      <QuickCopyDialog open={open} onOpenChange={handleOpenChange} />
    </div>
  );
}
