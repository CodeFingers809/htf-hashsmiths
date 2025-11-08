import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './app/globals.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey} appearance={{
      baseTheme: undefined,
      variables: {
        colorPrimary: "#00D9FF",
        colorBackground: "#0a0a0f",
        colorInputBackground: "rgba(26, 26, 46, 0.8)",
        colorInputText: "#ffffff",
        colorText: "#ffffff",
        colorTextSecondary: "#a1a1aa",
        colorTextOnPrimaryBackground: "#000000",
        colorNeutral: "#ffffff",
        colorSuccess: "#10b981",
        colorWarning: "#f59e0b",
        colorDanger: "#ef4444",
        fontFamily: "Rajdhani, sans-serif",
        fontFamilyButtons: "Rajdhani, sans-serif",
        fontSize: "16px",
        fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
        borderRadius: "0.5rem",
        spacingUnit: "1rem"
      },
      elements: {
        rootBox: "font-rajdhani",
        card: "cyber-card cyber-glow bg-background/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10",
        cardBox: "cyber-card cyber-glow bg-background/95 backdrop-blur-xl border border-cyan-500/20",
        headerTitle: "font-orbitron text-2xl font-bold neon-text text-center mb-2",
        headerSubtitle: "font-rajdhani text-muted-foreground text-center",
        formContainer: "space-y-6",
        formFieldRow: "space-y-2",
        formFieldLabel: "text-foreground font-rajdhani font-semibold text-sm",
        formFieldInput: "cyber-border bg-card/30 text-foreground font-rajdhani placeholder:text-muted-foreground focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300",
        formFieldInputShowPasswordButton: "text-cyan-400 hover:text-cyan-300 transition-colors",
        formButtonPrimary: "cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold transition-all duration-300 transform hover:scale-105",
        formButtonSecondary: "cyber-border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-rajdhani font-semibold transition-all duration-300",
        footerActionLink: "text-cyan-400 hover:text-cyan-300 font-rajdhani font-semibold transition-colors duration-300",
        footerActionText: "text-muted-foreground font-rajdhani",
        identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300 font-rajdhani",
        socialButtonsBlockButton: "cyber-border border-cyan-500/40 hover:border-cyan-500 text-foreground font-rajdhani transition-all duration-300",
        socialButtonsBlockButtonText: "font-rajdhani font-semibold",
        dividerLine: "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent",
        dividerText: "text-muted-foreground font-rajdhani text-sm",
        alertText: "font-rajdhani",
        userButtonBox: "cyber-border cyber-glow",
        userButtonTrigger: "cyber-border cyber-glow hover:bg-cyan-500/10 transition-all duration-300",
        userButtonPopoverCard: "cyber-card cyber-glow bg-background/95 backdrop-blur-xl border border-cyan-500/20",
        userButtonPopoverMain: "font-rajdhani",
        userButtonPopoverActionButton: "hover:bg-cyan-500/10 font-rajdhani transition-colors duration-300",
        userButtonPopoverActionButtonText: "font-rajdhani",
        userButtonPopoverFooter: "border-t border-cyan-500/20",
        userProfileSection: "border-b border-cyan-500/20 pb-6 mb-6",
        userProfileSectionPrimaryButton: "cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold",
        organizationSwitcherTrigger: "cyber-border cyber-glow hover:bg-cyan-500/10 transition-all duration-300",
        organizationSwitcherPopoverCard: "cyber-card cyber-glow bg-background/95 backdrop-blur-xl border border-cyan-500/20",
        badge: "bg-cyan-500/20 text-cyan-400 font-rajdhani font-semibold",
        avatarBox: "cyber-border cyber-glow",
        avatarImageActionsUpload: "cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani",
        navbar: "cyber-card bg-background/95 backdrop-blur-xl border-b border-cyan-500/20",
        navbarButton: "font-rajdhani hover:bg-cyan-500/10 transition-colors duration-300",
        pageScrollBox: "scrollbar-thin scrollbar-track-background scrollbar-thumb-cyan-500/30",
        spinner: "border-cyan-500 border-t-transparent",
        modalBackdrop: "bg-black/80 backdrop-blur-sm",
        modalContent: "cyber-card cyber-glow bg-background/95 backdrop-blur-xl border border-cyan-500/20",
        tableHead: "border-b border-cyan-500/20",
        tableBody: "font-rajdhani",
        tableRow: "border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors duration-300",
        tableCell: "font-rajdhani",
        formFieldErrorText: "text-red-400 font-rajdhani text-sm",
        formFieldSuccessText: "text-green-400 font-rajdhani text-sm",
        formFieldWarningText: "text-yellow-400 font-rajdhani text-sm",
        breadcrumbsItem: "font-rajdhani text-muted-foreground",
        breadcrumbsItemCurrent: "font-rajdhani text-cyan-400",
        breadcrumbsItemDivider: "text-muted-foreground",
        fileDropAreaBox: "cyber-border border-dashed border-cyan-500/40 hover:border-cyan-500 transition-colors duration-300",
        fileDropAreaButtonPrimary: "cyber-border cyber-glow bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani font-semibold",
        phoneInputBox: "cyber-border bg-card/30",
        otpCodeFieldInput: "cyber-border bg-card/30 text-center font-mono text-lg focus:border-cyan-400",
        menuButton: "font-rajdhani hover:bg-cyan-500/10 transition-colors duration-300",
        menuItem: "font-rajdhani hover:bg-cyan-500/10 transition-colors duration-300",
        menuList: "cyber-card cyber-glow bg-background/95 backdrop-blur-xl border border-cyan-500/20",
        tag: "bg-orange-500/20 text-orange-400 font-rajdhani",
        accordionTriggerButton: "font-rajdhani hover:bg-cyan-500/10 transition-colors duration-300",
        accordionContent: "font-rajdhani"
      }
    }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);
