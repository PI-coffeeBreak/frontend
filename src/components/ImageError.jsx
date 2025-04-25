import { useTranslation } from "react-i18next";

export function ImageError() {
    const { t } = useTranslation();
    
    return (
        <div className="absolute inset-0 bg-base-100 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-base-content/75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-base-content/75 mt-2">{t('common.media.imageError')}</p>
                <p className="text-base-content/50 text-xs mt-1">{t('common.media.imageErrorDetails')}</p>
            </div>
        </div>
    );
} 