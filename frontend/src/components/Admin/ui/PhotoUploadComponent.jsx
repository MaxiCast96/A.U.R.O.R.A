import React, { useState } from 'react';
import { Camera, Upload, X, User, Edit3 } from 'lucide-react';

const PhotoUploadComponent = ({ 
  currentPhoto, 
  onPhotoChange, 
  uploading = false,
  employeeName = '',
  size = 'large' // 'small', 'medium', 'large'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Configuraciones de tamaño
  const sizeConfigs = {
    small: { container: 'w-16 h-16', overlay: 'w-16 h-16', icon: 'w-4 h-4', text: 'text-xs' },
    medium: { container: 'w-24 h-24', overlay: 'w-24 h-24', icon: 'w-5 h-5', text: 'text-sm' },
    large: { container: 'w-32 h-32', overlay: 'w-32 h-32', icon: 'w-6 h-6', text: 'text-base' }
  };

  const config = sizeConfigs[size];

  const handleOpenWidget = () => {
    if (!window.cloudinary) {
      console.error("Cloudinary script not loaded");
      return;
    }

    const widget = window.cloudinary.createUploadWidget({
      cloudName: 'dv6zckgk4', // Tu cloud name
      uploadPreset: 'empleados_preset', // Necesitarás crear este preset
      sources: ['local', 'camera', 'url'],
      folder: "empleados_perfil",
      multiple: false,
      maxFiles: 1,
      cropping: true,
      croppingAspectRatio: 1, // Cuadrado
      croppingShowBackButton: true,
      croppingCoordinatesMode: 'custom',
      showAdvancedOptions: false,
      maxImageFileSize: 5000000, // 5MB
      maxVideoFileSize: 10000000, // 10MB
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#0891B2",
          tabIcon: "#0891B2",
          menuIcons: "#5A616A",
          textDark: "#000000",
          textLight: "#FFFFFF",
          link: "#0891B2",
          action: "#0891B2",
          inactiveTabIcon: "#0E2F5A",
          error: "#F44235",
          inProgress: "#0891B2",
          complete: "#20B832",
          sourceBg: "#E4EBF1"
        },
        fonts: {
          default: null,
          "'Poppins', sans-serif": {
            url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          }
        }
      },
      text: {
        es: {
          "queue.title": "Subir Foto de Perfil",
          "queue.title_uploading_with_counter": "Subiendo {{num}} archivo",
          "queue.title_uploading_processing_complete": "Procesando...",
          "local.browse": "Seleccionar archivo",
          "local.dd_title_single": "Arrastra tu foto aquí",
          "camera.capture": "Tomar foto",
          "camera.cancel": "Cancelar",
          "camera.take_pic": "Tomar foto",
          "camera.explanation": "Asegúrate de permitir el acceso a la cámara",
          "crop.title": "Recortar foto",
          "crop.crop_btn": "Recortar",
          "crop.skip_btn": "Usar original",
          "crop.reset_btn": "Restablecer",
          "crop.close_btn": "Cerrar",
          "crop.close_prompt": "Al cerrar se cancelará la subida. ¿Continuar?",
          "crop.image_error": "Error al cargar la imagen",
          "crop.corner_tooltip": "Arrastra para redimensionar",
          "crop.handle_tooltip": "Arrastra para mover"
        }
      }
    }, (error, result) => {
      if (error) {
        console.error('Error uploading:', error);
        return;
      }

      if (result && result.event === "success") {
        console.log('Upload successful:', result.info);
        onPhotoChange(result.info.secure_url);
      }

      // Eventos de progreso
      if (result && result.event === "upload-added") {
        setUploadProgress(10);
      }
      if (result && result.event === "upload-progress") {
        setUploadProgress(result.info.progress || 50);
      }
      if (result && result.event === "success") {
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    });

    widget.open();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? 
      `${parts[0][0]}${parts[1][0]}` : 
      parts[0][0];
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Contenedor principal de la foto */}
      <div 
        className={`relative ${config.container} group cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleOpenWidget}
      >
        {/* Imagen o avatar por defecto */}
        <div className={`${config.container} rounded-full overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100 border-4 border-white shadow-lg transition-all duration-300 group-hover:shadow-xl`}>
          {currentPhoto ? (
            <img 
              src={currentPhoto} 
              alt={employeeName || 'Foto de perfil'} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-200 to-blue-200">
              {employeeName ? (
                <span className="text-cyan-800 font-bold text-xl select-none">
                  {getInitials(employeeName)}
                </span>
              ) : (
                <User className="w-8 h-8 text-cyan-600" />
              )}
            </div>
          )}
        </div>

        {/* Overlay de hover */}
        <div className={`absolute inset-0 ${config.container} rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center`}>
          <div className="text-white text-center">
            {uploading ? (
              <div className="flex flex-col items-center space-y-1">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1">
                <Edit3 className={config.icon} />
                <span className="text-xs font-medium">
                  {currentPhoto ? 'Cambiar' : 'Subir'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cámara/editar */}
        <button
          type="button"
          className={`absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center border-2 border-white ${isHovered ? 'scale-110' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenWidget();
          }}
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Indicador de progreso */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute inset-0 rounded-full border-4 border-transparent">
            <div 
              className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"
              style={{
                background: `conic-gradient(from 0deg, #0891B2 ${uploadProgress * 3.6}deg, transparent ${uploadProgress * 3.6}deg)`
              }}
            />
          </div>
        )}
      </div>

      {/* Texto informativo */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {currentPhoto ? 'Cambiar foto de perfil' : 'Agregar foto de perfil'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Haz clic para {currentPhoto ? 'cambiar' : 'subir'} una foto
        </p>
      </div>

      {/* Botón alternativo para dispositivos móviles */}
      <button
        type="button"
        onClick={handleOpenWidget}
        disabled={uploading}
        className="sm:hidden w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Subiendo...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>{currentPhoto ? 'Cambiar foto' : 'Subir foto'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PhotoUploadComponent;