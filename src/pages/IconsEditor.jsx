import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ImagePlaceholder } from '../components/common/ImagePlaceholder.jsx';
import { ImageError } from '../components/event_maker/ImageError.jsx';
import { useTranslation } from "react-i18next";
import { useMedia } from "../contexts/MediaContext.jsx";
import { useNotification } from "../contexts/NotificationContext.jsx";
import { useManifest } from "../contexts/ManifestContext";

export function IconsEditor() {
    const { registerMedia, uploadMedia, getMediaUrl } = useMedia();
    const { showNotification } = useNotification();
    const { t } = useTranslation();
    const pwaIcon192InputRef = useRef(null);
    const pwaIcon512InputRef = useRef(null);
    const faviconInputRef = useRef(null);

    const [pwaIcon192Id, setPwaIcon192Id] = useState(null);
    const [pwaIcon512Id, setPwaIcon512Id] = useState(null);
    const [faviconId, setFaviconId] = useState(null);
    const [pwaIcon192Type, setPwaIcon192Type] = useState(null);
    const [pwaIcon512Type, setPwaIcon512Type] = useState(null);
    const [faviconType, setFaviconType] = useState(null);
    const [pwaIcon192Preview, setPwaIcon192Preview] = useState(null);
    const [pwaIcon512Preview, setPwaIcon512Preview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);
    const [pwaIcon192Error, setPwaIcon192Error] = useState(false);
    const [pwaIcon512Error, setPwaIcon512Error] = useState(false);
    const [faviconError, setFaviconError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [userChangedPwaIcon192, setUserChangedPwaIcon192] = useState(false);
    const [userChangedPwaIcon512, setUserChangedPwaIcon512] = useState(false);
    const [userChangedFavicon, setUserChangedFavicon] = useState(false);

    // Store initial values for comparison
    const [initialValues, setInitialValues] = useState({
        pwaIcon192Id: null,
        pwaIcon512Id: null,
        faviconId: null,
        pwaIcon192Type: null,
        pwaIcon512Type: null,
        faviconType: null
    });

    // Add file states
    const [pwaIcon192File, setPwaIcon192File] = useState(null);
    const [pwaIcon512File, setPwaIcon512File] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);

    const { fetchManifest, fetchFavicon, updateManifestIcon, updateFavicon } = useManifest();

    // Fetch manifest and favicon data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch manifest using context
                const manifest = await fetchManifest();
                const icon512 = manifest.icons.find(icon => icon.sizes === "512x512");
                const icon192 = manifest.icons.find(icon => icon.sizes === "192x192");
                if (icon512) {
                    const id = icon512.src.split('/').pop();
                    setPwaIcon512Id(id);
                    setPwaIcon512Type(icon512.type);
                    if (!userChangedPwaIcon512) setPwaIcon512Preview(icon512.src);
                }
                if (icon192) {
                    const id = icon192.src.split('/').pop();
                    setPwaIcon192Id(id);
                    setPwaIcon192Type(icon192.type);
                    if (!userChangedPwaIcon192) setPwaIcon192Preview(icon192.src);
                }
                // Fetch favicon using context
                const faviconData = await fetchFavicon();
                if (faviconData) {
                    const faviconPath = faviconData.url;
                    setFaviconId(faviconPath);
                    setFaviconType(faviconData.type);
                    if (!userChangedFavicon) setFaviconPreview(`${faviconPath.startsWith('http') ? '' : 'http://localhost'}${faviconPath}`);
                }
                setInitialValues({
                    pwaIcon192Id: icon192 ? icon192.src.split('/').pop() : null,
                    pwaIcon512Id: icon512 ? icon512.src.split('/').pop() : null,
                    faviconId: faviconData ? faviconData.url : null,
                    pwaIcon192Type: icon192 ? icon192.type : null,
                    pwaIcon512Type: icon512 ? icon512.type : null,
                    faviconType: faviconData ? faviconData.type : null
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                showNotification(t('iconsEditor.error.fetchData'), "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [fetchManifest, fetchFavicon, getMediaUrl, showNotification, t]);

    // Check for changes whenever any icon is modified
    useEffect(() => {
        const hasIconChanges = 
            pwaIcon192Id !== initialValues.pwaIcon192Id ||
            pwaIcon512Id !== initialValues.pwaIcon512Id ||
            faviconId !== initialValues.faviconId ||
            pwaIcon192Type !== initialValues.pwaIcon192Type ||
            pwaIcon512Type !== initialValues.pwaIcon512Type ||
            faviconType !== initialValues.faviconType ||
            userChangedPwaIcon192 ||
            userChangedPwaIcon512 ||
            userChangedFavicon;

        setHasChanges(hasIconChanges);
    }, [
        pwaIcon192Id, pwaIcon512Id, faviconId,
        pwaIcon192Type, pwaIcon512Type, faviconType,
        initialValues,
        userChangedPwaIcon192, userChangedPwaIcon512, userChangedFavicon
    ]);

    const handleSave = async () => {
        if (!pwaIcon192Id && !pwaIcon192File || !pwaIcon512Id && !pwaIcon512File || !faviconId && !faviconFile) {
            showNotification(t('iconsEditor.validation.requiredIcons'), "error");
            return;
        }
        setIsSubmitting(true);
        try {
            // Upload new files if present
            let newPwaIcon192Id = pwaIcon192Id;
            let newPwaIcon192Type = pwaIcon192Type;
            let newPwaIcon512Id = pwaIcon512Id;
            let newPwaIcon512Type = pwaIcon512Type;
            let newFaviconId = faviconId;
            let newFaviconType = faviconType;
            if (pwaIcon192File) {
                const response = await registerMedia();
                newPwaIcon192Id = response.uuid.toString();
                await uploadMedia(newPwaIcon192Id, pwaIcon192File);
                newPwaIcon192Type = pwaIcon192File.type.toString();
                setPwaIcon192Id(newPwaIcon192Id);
                setPwaIcon192Type(newPwaIcon192Type);
                setPwaIcon192File(null);
                setUserChangedPwaIcon192(false);
                await updateManifestIcon({
                    src: getMediaUrl(newPwaIcon192Id),
                    sizes: "192x192",
                    type: newPwaIcon192Type
                });
            }
            if (pwaIcon512File) {
                const response = await registerMedia();
                newPwaIcon512Id = response.uuid.toString();
                await uploadMedia(newPwaIcon512Id, pwaIcon512File);
                newPwaIcon512Type = pwaIcon512File.type.toString();
                setPwaIcon512Id(newPwaIcon512Id);
                setPwaIcon512Type(newPwaIcon512Type);
                setPwaIcon512File(null);
                setUserChangedPwaIcon512(false);

                console.log({
                    src: getMediaUrl(newPwaIcon512Id),
                    sizes: "512x512",
                    type: newPwaIcon512Type
                });
                await updateManifestIcon({
                    src: getMediaUrl(newPwaIcon512Id),
                    sizes: "512x512",
                    type: newPwaIcon512Type
                });
            }
            if (faviconFile) {
                const response = await registerMedia();
                newFaviconId = response.uuid.toString();
                await uploadMedia(newFaviconId, faviconFile);
                newFaviconType = faviconFile.type.toString();
                setFaviconId(newFaviconId);
                setFaviconType(newFaviconType);
                setFaviconFile(null);
                setUserChangedFavicon(false);

                await updateFavicon({
                    url: getMediaUrl(newFaviconId),
                    type: newFaviconType
                });
            }
            showNotification(t('iconsEditor.success.save'), "success");
        } catch (error) {
            console.error('Error saving icons:', error);
            showNotification(t('iconsEditor.error.save'), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePwaIcon192Click = () => {
        pwaIcon192InputRef.current?.click();
    };

    const handlePwaIcon512Click = () => {
        pwaIcon512InputRef.current?.click();
    };

    const handleFaviconClick = () => {
        faviconInputRef.current?.click();
    };

    const handlePwaIcon192Change = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showNotification(t('common.media.sizeError'), "error");
            return;
        }
        if (!file.type.startsWith('image/')) {
            showNotification(t('common.media.typeError'), "error");
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
            if (img.width !== 192 || img.height !== 192) {
                showNotification(
                    t('common.media.dimensionError', { width: 192, height: 192 }) ||
                    "Image must be exactly 192×192 pixels",
                    "error"
                );
                setPwaIcon192Error(true);
                if (pwaIcon192InputRef.current) {
                    pwaIcon192InputRef.current.value = '';
                }
                URL.revokeObjectURL(objectUrl);
                return;
            }
            setPwaIcon192Preview(objectUrl);
            setUserChangedPwaIcon192(true);
            setPwaIcon192Error(false);
            setPwaIcon192File(file);
        };
        img.onerror = () => {
            showNotification(t('common.media.imageLoadError') || "Unable to load the image", "error");
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    const handlePwaIcon512Change = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showNotification(t('common.media.sizeError'), "error");
            return;
        }
        if (!file.type.startsWith('image/')) {
            showNotification(t('common.media.typeError'), "error");
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
            if (img.width !== 512 || img.height !== 512) {
                showNotification(
                    t('common.media.dimensionError', { width: 512, height: 512 }) ||
                    "Image must be exactly 512×512 pixels",
                    "error"
                );
                setPwaIcon512Error(true);
                if (pwaIcon512InputRef.current) {
                    pwaIcon512InputRef.current.value = '';
                }
                URL.revokeObjectURL(objectUrl);
                return;
            }
            setPwaIcon512Preview(objectUrl);
            setUserChangedPwaIcon512(true);
            setPwaIcon512Error(false);
            setPwaIcon512File(file);
        };
        img.onerror = () => {
            showNotification(t('common.media.imageLoadError') || "Unable to load the image", "error");
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) {
            showNotification(t('common.media.sizeError'), "error");
            return;
        }
        // Allow image/svg+xml and image/x-icon (ico) and all image/*
        const isSvg = file.type === 'image/svg+xml';
        const isIco = file.type === 'image/x-icon' || file.name.endsWith('.ico');
        if (!file.type.startsWith('image/') && !isSvg && !isIco) {
            showNotification(t('common.media.typeError'), "error");
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        // For SVG and ICO files, skip dimension check
        if (isSvg || isIco) {
            setFaviconPreview(objectUrl);
            setUserChangedFavicon(true);
            setFaviconError(false);
            setFaviconFile(file);
            return;
        }
        // For regular images, check dimensions
        const img = new window.Image();
        img.onload = () => {
            if (img.width !== 32 || img.height !== 32) {
                showNotification(
                    t('common.media.dimensionError', { width: 32, height: 32 }) ||
                    "Image must be exactly 32×32 pixels",
                    "error"
                );
                setFaviconError(true);
                if (faviconInputRef.current) {
                    faviconInputRef.current.value = '';
                }
                URL.revokeObjectURL(objectUrl);
                return;
            }
            setFaviconPreview(objectUrl);
            setUserChangedFavicon(true);
            setFaviconError(false);
            setFaviconFile(file);
        };
        img.onerror = () => {
            showNotification(t('common.media.imageLoadError') || "Unable to load the image", "error");
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    const removePwaIcon192 = () => {
        setPwaIcon192Preview(null);
        setPwaIcon192Error(false);
        setPwaIcon192Id(null);
        setPwaIcon192Type(null);
        if (pwaIcon192InputRef.current) {
            pwaIcon192InputRef.current.value = '';
        }
    };

    const removePwaIcon512 = () => {
        setPwaIcon512Preview(null);
        setPwaIcon512Error(false);
        setPwaIcon512Id(null);
        setPwaIcon512Type(null);
        if (pwaIcon512InputRef.current) {
            pwaIcon512InputRef.current.value = '';
        }
    };

    const removeFavicon = () => {
        setFaviconPreview(null);
        setFaviconError(false);
        setFaviconId(null);
        setFaviconType(null);
        if (faviconInputRef.current) {
            faviconInputRef.current.value = '';
        }
    };

    const renderPwaIcon192Content = () => {
        if (!pwaIcon192Preview) return <ImagePlaceholder />;
        if (pwaIcon192Error) return <ImageError />;
        return (
            <>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={pwaIcon192Preview}
                        alt={t('common.media.pwaIcon192Alt') || "192x192 PWA Icon"}
                        className="max-w-full max-h-full object-contain"
                        onError={() => setPwaIcon192Error(true)}
                    />
                </div>
                <button
                    type="button"
                    onClick={removePwaIcon192}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error z-10"
                    aria-label={t('common.media.removeImage')}
                >
                    ×
                </button>
            </>
        );
    };

    const renderPwaIcon512Content = () => {
        if (!pwaIcon512Preview) return <ImagePlaceholder />;
        if (pwaIcon512Error) return <ImageError />;
        return (
            <>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={pwaIcon512Preview}
                        alt={t('common.media.pwaIcon512Alt') || "512x512 PWA Icon"}
                        className="max-w-full max-h-full object-contain"
                        onError={() => setPwaIcon512Error(true)}
                    />
                </div>
                <button
                    type="button"
                    onClick={removePwaIcon512}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error z-10"
                    aria-label={t('common.media.removeImage')}
                >
                    ×
                </button>
            </>
        );
    };

    const renderFaviconContent = () => {
        if (!faviconPreview) return <ImagePlaceholder />;
        if (faviconError) return <ImageError />;
        return (
            <>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src={faviconPreview}
                        alt={t('common.media.faviconAlt') || "32x32 Favicon"}
                        className="max-w-full max-h-full object-contain"
                        onError={() => setFaviconError(true)}
                    />
                </div>
                <button
                    type="button"
                    onClick={removeFavicon}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error z-10"
                    aria-label={t('common.media.removeImage')}
                >
                    ×
                </button>
            </>
        );
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-svh p-2 lg:p-8 flex justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="w-full min-h-svh p-2 lg:p-8">
            <h1 className="text-3xl font-bold my-8">{t('iconsEditor.title')}</h1>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label htmlFor="pwaIcon512" className="block mb-2 font-medium">
                        512x512 Image
                    </label>
                    <input
                        type="file"
                        ref={pwaIcon512InputRef}
                        id="pwaIcon512"
                        name="pwaIcon512"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePwaIcon512Change}
                    />
                    <button
                        type="button"
                        onClick={handlePwaIcon512Click}
                        className="btn btn-secondary mb-2 rounded-xl w-full"
                        aria-controls="pwaIcon512"
                    >
                        {pwaIcon512Preview ? t('common.media.changeImage') : t('common.media.selectImage')}
                    </button>
                    <div className="relative w-full h-48 bg-base-100 rounded-xl overflow-hidden border border-base-300">
                        {renderPwaIcon512Content()}
                    </div>
                </div>
                <div>
                    <label htmlFor="pwaIcon192" className="block mb-2 font-medium">
                        192x192 Image
                    </label>
                    <input
                        type="file"
                        ref={pwaIcon192InputRef}
                        id="pwaIcon192"
                        name="pwaIcon192"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePwaIcon192Change}
                    />
                    <button
                        type="button"
                        onClick={handlePwaIcon192Click}
                        className="btn btn-secondary mb-2 rounded-xl w-full"
                        aria-controls="pwaIcon192"
                    >
                        {pwaIcon192Preview ? t('common.media.changeImage') : t('common.media.selectImage')}
                    </button>
                    <div className="relative w-full h-48 bg-base-100 rounded-xl overflow-hidden border border-base-300">
                        {renderPwaIcon192Content()}
                    </div>
                </div>
                <div>
                    <label htmlFor="favicon" className="block mb-2 font-medium">
                        32x32 Favicon
                    </label>
                    <input
                        type="file"
                        ref={faviconInputRef}
                        id="favicon"
                        name="favicon"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFaviconChange}
                    />
                    <button
                        type="button"
                        onClick={handleFaviconClick}
                        className="btn btn-secondary mb-2 rounded-xl w-full"
                        aria-controls="favicon"
                    >
                        {faviconPreview ? t('common.media.changeImage') : t('common.media.selectImage')}
                    </button>
                    <div className="relative w-full h-48 bg-base-100 rounded-xl overflow-hidden border border-base-300">
                        {renderFaviconContent()}
                    </div>
                </div>
            </div>
            <div className="divider"></div>
            <div className="flex justify-end gap-4 mt-8">
                <button
                    type="button"
                    onClick={handleSave}
                    className="btn btn-primary rounded-xl"
                    disabled={isSubmitting || !hasChanges}
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            {' '}{t('iconsEditor.actions.saving')}
                        </>
                    ) : (
                        t('iconsEditor.actions.save')
                    )}
                </button>
            </div>
        </div>
    );
}

export default IconsEditor;
