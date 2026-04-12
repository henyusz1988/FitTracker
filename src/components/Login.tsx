import React, { useState, useEffect } from "react";
import { Dumbbell, LogIn, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle, signInWithGoogleRedirect, handleRedirectResult } from "../firebase";
import { APP_NAME, BUILD_VERSION } from "../constants";
import { motion, AnimatePresence } from "motion/react";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    // Check for redirect result on mount
    const checkRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result) {
          console.log("Redirect sign-in successful");
        }
      } catch (err: any) {
        console.error("Redirect error", err);
        setError("Redirect sign-in failed. Please try again.");
      }
    };
    checkRedirect();

    // Show troubleshooting after 10 seconds of loading
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowTroubleshooting(true);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    setShowTroubleshooting(false);
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIframe = window.self !== window.top;

    try {
      // If on mobile and NOT in an iframe, redirect is usually more reliable
      if (isMobile && !isIframe) {
        await signInWithGoogleRedirect();
      } else {
        await signInWithGoogle();
      }
    } catch (err: any) {
      console.error("Login failed", err);
      let message = "Login failed. Please try again.";
      if (err.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized in Firebase. Please add your current URL to 'Authorized domains' in the Firebase Console.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = "The login popup was closed before completion.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = "Login request was cancelled.";
      } else if (err.code === 'auth/popup-blocked') {
        message = "The login popup was blocked by your browser. Please allow popups for this site.";
      }
      setError(message);
      setLoading(false);
    }
  };

  const handleRedirectLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogleRedirect();
    } catch (err: any) {
      setError("Redirect failed. Please try the standard login or open in a new tab.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <Dumbbell className="text-white w-10 h-10" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">{APP_NAME}</CardTitle>
              <p className="text-muted-foreground text-xs font-mono">Build v{BUILD_VERSION}</p>
              <p className="text-muted-foreground">Your personal fitness & health companion</p>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3 text-destructive text-sm mb-4"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                <p>Track workouts, weight, and nutrition</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                <p>Monitor stress, sleep, and hydration</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                <p>Sync your data across all devices</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {loading ? "Signing in..." : "Sign in with Google"}
              </Button>

              <AnimatePresence>
                {showTroubleshooting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-muted/50 rounded-xl space-y-3 border border-border"
                  >
                    <p className="text-xs font-medium text-muted-foreground text-center">
                      Still loading? Mobile browsers sometimes block sign-in popups.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRedirectLogin}
                        className="text-xs h-10"
                      >
                        Try Redirect Method
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="text-xs h-10"
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-center text-xs text-muted-foreground px-4">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
