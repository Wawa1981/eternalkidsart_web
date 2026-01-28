import React, { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/Components/ui/button";
import { toast } from "sonner";

function Field({ label, type = "text", value, onChange, autoComplete }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
      />
    </label>
  );
}

export default function AuthDialog({
  open,
  onOpenChange,
  defaultTab = "login", // "login" | "register"
  onAuthed,            // (user) => void
}) {
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // reset tab when reopened with a different defaultTab
  React.useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    if (tab === "register" && !fullName) return false;
    return true;
  }, [tab, email, password, fullName]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    try {
      let user;
      if (tab === "login") {
        user = await base44.auth.login({ email, password });
        toast.success("Connecté ✅");
      } else {
        user = await base44.auth.register({ full_name: fullName, email, password });
        toast.success("Compte créé ✅");
      }

      onAuthed?.(user);

      // close + clear password
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-xl border border-rose-100 overflow-hidden">
          <div className="p-5 border-b border-rose-100 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-800">
                Accéder à Dessins Éternels
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500">
                Connexion ou création de compte
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Fermer"
                className="p-2 rounded-xl hover:bg-rose-50 text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-5">
            <Tabs.Root value={tab} onValueChange={setTab}>
              <Tabs.List className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-rose-50 mb-4">
                <Tabs.Trigger
                  value="login"
                  className={`rounded-xl py-2 text-sm font-medium transition ${
                    tab === "login" ? "bg-white shadow text-rose-700" : "text-gray-600"
                  }`}
                >
                  Connexion
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="register"
                  className={`rounded-xl py-2 text-sm font-medium transition ${
                    tab === "register" ? "bg-white shadow text-rose-700" : "text-gray-600"
                  }`}
                >
                  Inscription
                </Tabs.Trigger>
              </Tabs.List>

              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === "register" && (
                  <Field
                    label="Nom complet"
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                  />
                )}

                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />

                <Field
                  label="Mot de passe"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />

                <div className="pt-2 flex gap-2">
                  <Button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="flex-1 bg-gradient-to-r from-rose-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl"
                  >
                    {loading ? "..." : (tab === "login" ? "Se connecter" : "Créer un compte")}
                  </Button>

                  <Dialog.Close asChild>
                    <Button type="button" variant="ghost" className="rounded-xl">
                      Annuler
                    </Button>
                  </Dialog.Close>
                </div>
              </form>

              <p className="mt-3 text-xs text-gray-500">
                (Pour l’instant on va brancher ça sur le backend Express local.)
              </p>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
