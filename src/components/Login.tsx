import React, { useState } from "react";
import { Dumbbell, LogIn, UserPlus, AlertCircle, RefreshCw, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserProfile } from "../services/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  getEmailFromUsername,
  auth
} from "../firebase";
import { APP_NAME, BUILD_VERSION } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t('login_error'));
      return;
    }

    // Basic validation: alphanumeric only, 3-15 chars for username
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      setError(t('choose_username'));
      return;
    }

    if (password.length < 6) {
      setError(t('weak_password'));
      return;
    }

    setError(null);
    setLoading(true);

    const email = getEmailFromUsername(username);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user.uid, username);
      }
    } catch (err: any) {
      console.error("Auth error", err);
      let message = t('login_error');
      
      if (err.code === 'auth/user-not-found') {
        message = t('user_not_found');
        setMode("register");
      } else if (err.code === 'auth/wrong-password') {
        message = t('wrong_password');
      } else if (err.code === 'auth/email-already-in-use') {
        message = t('email_in_use');
      } else if (err.code === 'auth/weak-password') {
        message = t('weak_password');
      } else if (err.code === 'auth/invalid-credential') {
        message = t('invalid_credential');
      } else if (err.code === 'auth/operation-not-allowed') {
        message = t('operation_not_allowed');
      } else if (err.message?.includes('PERMISSION_DENIED')) {
        message = t('permission_denied');
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10 my-auto"
      >
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center space-y-4 pb-2 pt-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <Dumbbell className="text-white w-10 h-10" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">{APP_NAME}</CardTitle>
              <p className="text-muted-foreground text-xs font-mono">Build v{BUILD_VERSION}</p>
              <p className="text-muted-foreground text-sm px-4">Your personal fitness & health companion</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">{error}</p>
                    {error.includes(t('login_error')) && (
                      <p className="text-[10px] opacity-80">
                        Tip: If you're on iPhone, ensure "Prevent Cross-Site Tracking" is disabled in Safari settings for this app to work in the preview.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  placeholder="e.g. gym_bro_99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 text-lg rounded-xl"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 text-lg rounded-xl pr-10"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : mode === "login" ? (
                  <LogIn className="w-5 h-5 mr-2" />
                ) : (
                  <UserPlus className="w-5 h-5 mr-2" />
                )}
                {loading ? t('processing') : mode === "login" ? t('sign_in') : t('create_account')}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm text-primary font-medium hover:underline"
                disabled={loading}
              >
                {mode === "login" ? t('need_account') : t('have_account')}
              </button>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-4">
                <Lock className="w-3 h-3" />
                {t('secure_login')}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <p>{t('choose_username')}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <p>{t('set_password')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
