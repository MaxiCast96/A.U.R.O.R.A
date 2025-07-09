// src/components/ui/ConfirmationModal.jsx
import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-bounceIn">
                <div className="bg-red-500 text-white p-6 rounded-t-xl">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="text-xl font-bold">{title}</h3>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-4">{message}</p>
                    <p className="text-red-600 text-sm">Esta acción no se puede deshacer.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger flex items-center space-x-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Confirmar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;