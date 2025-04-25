import { useTranslation } from "react-i18next";

export function ImagePlaceholder() {
    const { t } = useTranslation();
    
    return (
        <div className="absolute inset-0 bg-base-100 rounded-lg border-2 border-dashed border-base-300 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-base-content/50 text-center">{t('common.media.noImage')}</p>
            </div>
        </div>
    );
} 