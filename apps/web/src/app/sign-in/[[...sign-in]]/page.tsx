import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-orbitron text-4xl font-black neon-text mb-2">
            SCOUT<span className="neon-orange-text">LETE</span>
          </h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Enter the Digital Assessment Grid
          </p>
        </div>

        <SignIn
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#00D9FF",
              colorBackground: "#0a0a0f",
              colorInputBackground: "#1a1a2e",
              colorInputText: "#ffffff",
              colorText: "#ffffff",
              colorTextSecondary: "#a1a1aa",
              colorNeutral: "#ffffff",
              fontFamily: "Rajdhani, sans-serif",
              borderRadius: "0.5rem"
            },
            elements: {
              rootBox: "mx-auto",
              card: "cyber-card cyber-glow bg-card/95 backdrop-blur-sm",
              headerTitle: "font-orbitron text-cyan-300 text-xl font-bold",
              headerSubtitle: "font-rajdhani text-white opacity-90 text-base",
              socialButtonsBlockButton: "cyber-border bg-gray-800/80 text-white hover:bg-gray-700/80 font-rajdhani border-cyan-500/40",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-cyan-500/40",
              dividerText: "text-white font-rajdhani",
              formFieldLabel: "text-white font-rajdhani font-semibold text-sm mb-2 block",
              formFieldInput: "cyber-border bg-gray-800/60 text-white font-rajdhani placeholder:text-gray-400 border-cyan-500/40 focus:border-cyan-400 focus:bg-gray-800/80 px-4 py-3 text-base",
              formButtonPrimary: "cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold transition-all duration-300 text-base py-3",
              footerActionLink: "text-cyan-400 hover:text-cyan-300 font-rajdhani font-medium",
              identityPreviewText: "text-white font-rajdhani",
              formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
              otpCodeFieldInput: "cyber-border bg-gray-800/60 text-white text-center text-lg font-bold border-cyan-500/40 focus:border-cyan-400",
              formFieldErrorText: "text-red-400 font-rajdhani text-sm mt-1",
              formFieldSuccessText: "text-green-400 font-rajdhani text-sm mt-1",
              formFieldWarningText: "text-orange-400 font-rajdhani text-sm mt-1",
              alternativeMethodsBlockButton: "text-cyan-400 hover:text-cyan-300 font-rajdhani",
              backButton: "text-cyan-400 hover:text-cyan-300 font-rajdhani"
            }
          }}
        />
      </div>
    </div>
  );
}