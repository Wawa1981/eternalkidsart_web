import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import AuthDialog from '@/Components/ui/AuthDialog';
import {
  Home,
  Palette,
  Users,
  ShoppingBag,
  Image,
  Menu,
  X,
  LogOut,
  User,
  Sparkles,
  Gamepad2,
  Brush
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      } finally {
        setUserLoaded(true);
      }
    };
    loadUser();
  }, []);

  // Pages protégées (redirige vers Landing si pas loggé)
  useEffect(() => {
    const protectedPages = new Set(['Dashboard', 'Museum', 'Games', 'PaintStudio']);
    if (userLoaded && !user && protectedPages.has(currentPageName)) {
      navigate(createPageUrl('Landing'), { replace: true });
    }
  }, [user, userLoaded, currentPageName, navigate]);

  useEffect(() => {
    const onAuthOpen = (ev) => {
      const tab = ev?.detail?.tab || "login";
      setAuthTab(tab);
      setAuthOpen(true);
    };
    window.addEventListener("auth:open", onAuthOpen);
    return () => window.removeEventListener("auth:open", onAuthOpen);
  }, []);

  const isLandingPage = currentPageName === 'Landing';

  const navItems = [
    { name: 'Accueil', page: 'Landing', icon: Home },
    { name: 'Mon Espace', page: 'Dashboard', icon: Palette, requiresAuth: true },
    { name: 'Musée Virtuel', page: 'Museum', icon: Sparkles, requiresAuth: true },

    // ✅ AJOUT
    { name: 'Jeux', page: 'Games', icon: Gamepad2, requiresAuth: true },
    { name: 'Atelier dessin', page: 'PaintStudio', icon: Brush, requiresAuth: true },

    { name: 'Galerie Publique', page: 'Gallery', icon: Image },
    { name: 'Communauté', page: 'Community', icon: Users },
    { name: 'Boutique', page: 'Shop', icon: ShoppingBag },
  ];

  const filteredNavItems = navItems.filter(item => !item.requiresAuth || user);

  const doLogoutAndGoLanding = async () => {
    try {
      await base44.auth.logout();
    } catch {}
    setUser(null);
    setIsMenuOpen(false);
    navigate(createPageUrl('Landing'), { replace: true });
  };

  if (isLandingPage && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-50">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap');

          :root {
            --pastel-pink: #FFD6E0;
            --pastel-blue: #C5E8F7;
            --pastel-yellow: #FFF3CD;
            --pastel-green: #D4EDDA;
            --pastel-purple: #E8D5F2;
            --pastel-orange: #FFE5D0;
          }

          body { font-family: 'Quicksand', sans-serif; }
          .font-handwritten { font-family: 'Caveat', cursive; }
        `}</style>

        <AuthDialog
          open={authOpen}
          onOpenChange={setAuthOpen}
          defaultTab={authTab}
          onAuthed={(u) => setUser(u)}
        />

        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap');

        :root {
          --pastel-pink: #FFD6E0;
          --pastel-blue: #C5E8F7;
          --pastel-yellow: #FFF3CD;
          --pastel-green: #D4EDDA;
          --pastel-purple: #E8D5F2;
          --pastel-orange: #FFE5D0;
        }

        body { font-family: 'Quicksand', sans-serif; }
        .font-handwritten { font-family: 'Caveat', cursive; }
      `}</style>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
        onAuthed={(u) => setUser(u)}
      />

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-amber-300 flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="font-handwritten text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                Dessins Éternels
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-200 to-amber-200 text-rose-700'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50">
                    <User className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-medium text-rose-700">{user.full_name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={doLogoutAndGoLanding}
                    className="text-gray-500 hover:text-rose-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin("login")}
                    className="text-gray-600"
                  >
                    Se connecter
                  </Button>
                  <Button
                    onClick={() => base44.auth.redirectToLogin("register")}
                    className="bg-gradient-to-r from-rose-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white rounded-full"
                  >
                    Créer un compte
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-rose-100"
            >
              <div className="px-4 py-4 space-y-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700'
                          : 'text-gray-600 hover:bg-rose-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
                {user ? (
                  <Button
                    variant="ghost"
                    onClick={doLogoutAndGoLanding}
                    className="w-full justify-start gap-3 text-gray-500"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </Button>
                ) : (
                  <div className="pt-2 space-y-2">
                    <Button
                      onClick={() => base44.auth.redirectToLogin("register")}
                      className="w-full bg-gradient-to-r from-rose-400 to-amber-400 text-white rounded-xl"
                    >
                      Créer un compte
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => base44.auth.redirectToLogin("login")}
                      className="w-full rounded-xl"
                    >
                      Se connecter
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
