import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  TbSun,
  TbSparkles,
  TbCommand,
} from "react-icons/tb";
import { LoginPanel } from "./LoginPanel";
import { useAuthStore } from "../../store/authStore";
import { toast } from "../../utils/toast";
import { Button } from "../ui/ButtonProps";

// Import avatars
import av1 from "../../../public/avatars/av1.png";
import av2 from "../../../public/avatars/av2.png";
import av3 from "../../../public/avatars/av3.png";
import av4 from "../../../public/avatars/av4.png";
import av5 from "../../../public/avatars/av5.png";
import av6 from "../../../public/avatars/av6.png";

const avatarMap: Record<string, string> = {
  av1,
  av2,
  av3,
  av4,
  av5,
  av6,
};

export function Header() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userAvatar, setUserAvatar] = useState(av1);

  const { user, isAuthenticated, logout } = useAuthStore();

  // Load stored avatar
  useEffect(() => {
    const saved = localStorage.getItem("userAvatar");
    if (saved) {
      const { avatarId } = JSON.parse(saved);
      setUserAvatar(avatarMap[avatarId] || av1);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  const handleLogout = async () => {
    try {
      const response = await logout();
      console.log(response);
      toast.success(response.message || "Logged out successfully");
      setShowUserMenu(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30">
        <div className="flex items-center justify-between h-20">
          {/* Left - Brand + Greeting */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-brand via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Invoice Ready
                </span>
                <span className="text-xs text-text-muted font-medium">
                  Smart invoicing for modern businesses
                </span>
              </div>
            </div>

            <span className="sm:hidden text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent">
              IR
            </span>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center justify-center gap-2">
            {/* Search */}
            <motion.div
              animate={{ width: searchFocused ? 320 : 200 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative hidden md:block"
            >
              <TbSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted z-10" />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none  focus:ring-brand focus:bg-white transition-all border  focus:border-brand boder border-brand"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-white border border-border rounded-md text-text-muted font-mono pointer-events-none">
                <TbCommand size={12} className="inline -mt-px" />K
              </kbd>
            </motion.div>

            {/* Mobile Search */}
            <button className="p-2.5 hover:bg-surface-hover rounded-2xl transition-colors md:hidden">
              <TbSearch size={20} className="text-text-secondary" />
            </button>

            {/* Notification Bell */}
            <button className="relative p-2.5 hover:bg-surface-hover rounded-2xl transition-colors group">
              <TbBell
                size={20}
                className="text-text-secondary group-hover:text-text-primary transition-colors"
              />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-white">
                <span className="absolute inset-0 bg-danger rounded-full animate-ping opacity-75" />
              </span>
            </button>

            <Link to={"/invoice/new-invoice"}>
              <Button variant="primary" size="md" icon={TbPlus}>
                New Invoice
              </Button>
            </Link>

            {/* User Avatar / Login */}
            {isAuthenticated ? (
              <div className="relative flex justify-center">
                <img
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  src={userAvatar}
                  alt="Avatar"
                  className="w-12 h-12 object-cover cursor-pointer rounded-full hover:shadow-xl hover:shadow-brand/20 hover:-translate-y-0.5 transition-all duration-300"
                />
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-14 w-64 bg-white rounded-3xl border border-border shadow-2xl z-20 overflow-hidden"
                      >
                        {/* User Info Banner */}
                        <div className="px-5 py-4 bg-gradient-to-br from-brand/5 to-purple-500/5 border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0">
                              <img
                                src={userAvatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-text-primary truncate">
                                {user?.name}
                              </p>
                              <p className="text-xs text-text-muted truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
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
                            {
                              icon: TbHelp,
                              label: "Help & Support",
                              path: "#",
                            },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                navigate(item.path);
                                setShowUserMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                            >
                              <item.icon size={18} className="shrink-0" />
                              {item.label}
                            </button>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-danger hover:bg-danger-light/50 transition-all font-medium"
                          >
                            <TbLogout size={18} className="shrink-0" />
                            Sign Out
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
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-border rounded-2xl text-sm font-semibold text-text-secondary hover:border-brand hover:text-brand hover:bg-brand-light/10 transition-all duration-200"
              >
                <TbLogin size={18} />
                <span className="hidden sm:block">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Slide-in Panel */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogin(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col rounded-l-3xl"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
                <h2 className="text-lg font-bold text-text-primary">
                  Welcome Back
                </h2>
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
