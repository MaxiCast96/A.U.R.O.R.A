// src/components/ui/Alert.jsx
import React, { useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

const Alert = ({ alert, onClose }) => {
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [alert, onClose]);

    if (!alert) return null;

    const isSuccess = alert.type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 animate-slideInDown ${bgColor}`}>
            <div className="flex items-center space-x-2">
                {isSuccess ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{alert.message}</span>
            </div>
        </div>
    );
};

export default Alert;