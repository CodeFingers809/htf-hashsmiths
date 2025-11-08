"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

interface ConfirmDialogProps {
  id: string
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

interface NotificationContextType {
  notifications: NotificationProps[]
  confirmDialog: ConfirmDialogProps | null
  addNotification: (notification: Omit<NotificationProps, 'id'>) => void
  removeNotification: (id: string) => void
  showConfirm: (props: Omit<ConfirmDialogProps, 'id'>) => Promise<boolean>
  alert: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Custom Alert Hook
export function useAlert() {
  const { alert } = useNotifications()
  return {
    success: (message: string) => alert(message, 'success'),
    error: (message: string) => alert(message, 'error'),
    info: (message: string) => alert(message, 'info'),
    warning: (message: string) => alert(message, 'warning')
  }
}

// Custom Confirm Hook
export function useConfirm() {
  const { showConfirm } = useNotifications()
  return showConfirm
}

function NotificationItem({ notification, onRemove }: {
  notification: NotificationProps
  onRemove: (id: string) => void
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'error': return <AlertCircle className="w-5 h-5" />
      case 'warning': return <AlertTriangle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getColors = () => {
    switch (notification.type) {
      case 'success': return 'border-green-500/30 bg-green-500/10 text-green-400'
      case 'error': return 'border-red-500/30 bg-red-500/10 text-red-400'
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
      default: return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
    }
  }

  React.useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`cyber-card p-4 min-w-80 max-w-md ${getColors()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium font-orbitron">{notification.title}</p>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 text-current hover:opacity-75 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

function ConfirmDialog({ dialog, onConfirm, onCancel }: {
  dialog: ConfirmDialogProps
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="relative cyber-card p-6 w-full max-w-md mx-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-neon-orange" />
          <h3 className="text-lg font-semibold font-orbitron neon-text">
            {dialog.title}
          </h3>
        </div>

        <p className="text-foreground/90 mb-6">
          {dialog.message}
        </p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="cyber-border"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-neon-orange hover:bg-neon-orange/90"
          >
            Confirm
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps | null>(null)

  const addNotification = useCallback((notification: Omit<NotificationProps, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: NotificationProps = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    }
    setNotifications(prev => [...prev, newNotification])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const showConfirm = useCallback((props: Omit<ConfirmDialogProps, 'id'>): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = Date.now().toString()
      setConfirmDialog({
        ...props,
        id,
        onConfirm: () => {
          setConfirmDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmDialog(null)
          resolve(false)
        }
      })
    })
  }, [])

  const alert = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    addNotification({ title: message, type })
  }, [addNotification])

  const value = {
    notifications,
    confirmDialog,
    addNotification,
    removeNotification,
    showConfirm,
    alert
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <ConfirmDialog
            dialog={confirmDialog}
            onConfirm={confirmDialog.onConfirm}
            onCancel={confirmDialog.onCancel}
          />
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  )
}