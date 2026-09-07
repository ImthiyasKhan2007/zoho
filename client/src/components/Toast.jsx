import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    zIndex: 1000,
                }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            background: "var(--surface)",
                            border: `1px solid ${toast.type === "error" ? "var(--down)" : "var(--up)"}`,
                            color: toast.type === "error" ? "var(--down)" : "var(--up)",
                            padding: "12px 18px",
                            borderRadius: "var(--radius)",
                            fontSize: "13px",
                            fontWeight: 500,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                            minWidth: "220px",
                            animation: "slideIn 0.2s ease-out",
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}