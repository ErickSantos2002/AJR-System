import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
    return (
        <HotToaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#1e293b",
                    color: "#fff",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    padding: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: "#10b981",
                        secondary: "#fff",
                    },
                    style: {
                        border: "1px solid #10b981",
                    },
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: "#ef4444",
                        secondary: "#fff",
                    },
                    style: {
                        border: "1px solid #ef4444",
                    },
                },
                loading: {
                    iconTheme: {
                        primary: "#3b82f6",
                        secondary: "#fff",
                    },
                },
            }}
        />
    );
}
