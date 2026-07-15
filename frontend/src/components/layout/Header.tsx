import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  TbSearch,
  TbBell,
  TbPlus,
  TbUser,
  TbLogin,
  TbSettings,
  TbHelp,
  TbLogout,
  TbX,
} from "react-icons/tb";
import { LoginPanel } from "./LoginPanel";
import { useAuthStore } from "../../store/authStore";
import { toast } from "../../utils/toast";

export function Header() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const response = await logout();
      console.log(response)
      toast.success(response.message || "Logged out successfully");
      setShowUserMenu(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-border">
        <div className="flex items-center justify-between px-8 h-16">
          {/* Left - Search */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search invoices, clients..."
                className="pl-10 pr-4 py-2 w-80 bg-surface rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all border border-transparent focus:border-brand/30"
              />
            </div>
            <kbd className="px-2 py-1 text-xs bg-surface border border-border rounded-lg text-text-muted font-mono hidden lg:block">
              ⌘K
            </kbd>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-surface-hover rounded-xl transition-colors">
              <TbBell size={20} className="text-text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full animate-pulse" />
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-brand/25">
              <TbPlus size={16} />
              <span className="hidden sm:block">New Invoice</span>
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-all"
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-border shadow-xl z-20 py-2"
                      >
                        <div className="px-4 py-3 border-b border-border-light">
                          <p className="text-sm font-medium text-text-primary">
                            {user?.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {user?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          {[
                            {
                              icon: TbUser,
                              label: "Profile",
                              path: "/profile",
                            },
                            {
                              icon: TbSettings,
                              label: "Settings",
                              path: "/settings",
                            },
                            { icon: TbHelp, label: "Help", path: "#" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                navigate(item.path);
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface transition-colors"
                            >
                              <item.icon size={16} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <div className="py-1 border-t border-border-light">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                          >
                            <TbLogout size={16} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
              >
                <TbLogin size={16} />
                <span className="hidden sm:block">Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Slide-in Panel from Right */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowLogin(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
                <h2 className="text-lg font-bold text-text-primary">Sign In</h2>
                <button
                  onClick={() => setShowLogin(false)}
                  className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
                >
                  <TbX size={20} className="text-text-secondary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <LoginPanel onSuccess={() => setShowLogin(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
