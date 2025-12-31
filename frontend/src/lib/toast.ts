import toast from "react-hot-toast";

/**
 * Exibe uma notificação de sucesso
 */
export const showSuccess = (message: string) => {
    toast.success(message);
};

/**
 * Exibe uma notificação de erro
 */
export const showError = (message: string, error?: unknown) => {
    const errorMessage =
        error instanceof Error ? `${message}: ${error.message}` : message;
    toast.error(errorMessage);
};

/**
 * Exibe uma notificação de carregamento
 */
export const showLoading = (message: string) => {
    return toast.loading(message);
};

/**
 * Remove uma notificação específica
 */
export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};

/**
 * Executa uma operação async com feedback de toast
 */
export const toastPromise = async <T,>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string;
        error: string;
    }
): Promise<T> => {
    return toast.promise(promise, messages);
};

/**
 * Mostra uma notificação customizada
 */
export const showCustom = (message: string, icon?: string) => {
    toast(message, {
        icon: icon,
    });
};
