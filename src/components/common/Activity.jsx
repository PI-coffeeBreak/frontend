import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useMedia } from '../../contexts/MediaContext.jsx';

export default function Activity({ id, title, description, image, category, type, onDelete, onEdit, mode, metadata, activityTypes}) {
  const { t } = useTranslation();
  const { getMediaUrl } = useMedia();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  // When image prop changes, update the image URL
  useEffect(() => {
    if (image) {
      const isImageLink = image.startsWith('http');
      if (!isImageLink) {
        const mediaUrl = getMediaUrl(image);
        setImageUrl(mediaUrl);
      } else {
        setImageUrl(image);
      }
      setImageError(false);
    } else {
      setImageUrl(null);
      setImageError(false);
    }
  }, [id, image, getMediaUrl]);

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const typeObj = activityTypes.find(t => t.type === type);

  const badgeStyle = {
  backgroundColor: typeObj?.color || '#3788d8',
  borderColor: typeObj?.color || '#3788d8',
  color: '#ffffff'
};

  return (
    <div
      className="fc-event cursor-pointer flex items-center w-full gap-4 h-36 p-4 rounded-xl bg-white relative"
      data-id={id}
      data-title={title}
    >
      {mode === 'both' ? (
        <div className="absolute top-2 right-2 flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('activities.edit')}
              type="button"
            >
              <FaEdit className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="p-2 text-gray-400 hover:text-error rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('activities.delete')}
              type="button"
            >
              <FaTrash className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Single button mode (only edit or only delete) */}
          {onDelete && mode === 'delete' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-error rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('activities.delete')}
              type="button"
            >
              <FaTrash className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
  
          {onEdit && mode === 'edit' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
              aria-label={t('activities.edit')}
              type="button"
            >
              <FaEdit className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </>
      )}

      <div className="w-1/3 h-full items-center justify-center hidden sm:flex overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={t('activities.imageAlt')}
            className="w-full h-full object-cover rounded-md"
            onLoad={handleImageLoad}
            onError={handleImageError}
            key={`activity-img-${id}-${imageUrl}`} // Force image reload when URL changes
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-gray-400">{t('activities.noImage')}</span>
          </div>
        )}
      </div>

      <div className="w-2/3">
        <h1 className="font-bold text-secondary text-sm">{title}</h1>
        <p className="text-sm mt-2 text-gray-600">{description}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <span className="badge rounded-xl" style={badgeStyle}>
            {type}
          </span>
          {category && <span className="badge badge-primary">{category}</span>}
          {metadata?.is_restricted && (
            <span className="badge badge-outline">
              {metadata.registered} / {metadata.slots} {t('activities.slots.title')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

Activity.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
  category: PropTypes.string,
  type: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  mode: PropTypes.oneOf(['edit', 'delete', 'both']),
  metadata: PropTypes.shape({
    is_restricted: PropTypes.bool,
    slots: PropTypes.number,
    registered: PropTypes.number
  }),
  activityTypes: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      color: PropTypes.string
    })
  ).isRequired
};

Activity.defaultProps = {
  description: '',
  image: '',
  category: '',
  onDelete: null,
  onEdit: null,
  mode: 'delete',
  metadata: null,
  activityTypes: []
};
