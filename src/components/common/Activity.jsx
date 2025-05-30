import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useMedia } from '../../contexts/MediaContext.jsx';

const ActivityImage = ({ image, id, t }) => {
  const { getMediaUrl } = useMedia();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (image) {
      const isImageLink = image.startsWith('http');
      setImageUrl(isImageLink ? image : getMediaUrl(image));
      setImageError(false);
    } else {
      setImageUrl(null);
      setImageError(false);
    }
  }, [id, image, getMediaUrl]);

  if (!imageUrl || imageError) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">{t('activities.noImage')}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={t('activities.imageAlt')}
      className="w-full h-full object-cover rounded-md"
      onError={() => setImageError(true)}
      key={`activity-img-${id}-${imageUrl}`}
    />
  );
};

ActivityImage.propTypes = {
  image: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  t: PropTypes.func.isRequired
};

const ActionButtons = ({ id, onEdit, onDelete, mode, t }) => {
  if (mode !== 'both' && mode !== 'edit' && mode !== 'delete') return null;

  return (
    <div className="absolute top-2 right-2 flex gap-2">
      {onEdit && (mode === 'both' || mode === 'edit') && (
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
      
      {onDelete && (mode === 'both' || mode === 'delete') && (
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
  );
};

ActionButtons.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  mode: PropTypes.oneOf(['edit', 'delete', 'both']),
  t: PropTypes.func.isRequired
};

const getBadgeStyle = (typeObj) => ({
  backgroundColor: typeObj?.color || 'var(--color-primary)',
  borderColor: typeObj?.color || 'var(--color-primary)',
  color: '#ffffff'
});

export default function Activity({ id, title, description, image, category, type, onDelete, onEdit, mode, metadata, activityTypes}) {
  const { t } = useTranslation();
  const typeObj = activityTypes.find(t => t.type === type);

  return (
    <div
      className="fc-event cursor-pointer flex w-full gap-4 h-36 p-4 rounded-xl bg-white relative"
      data-id={id}
      data-title={title}
      style={{ minHeight: '9rem' }}
    >
      <ActionButtons 
        id={id}
        onEdit={onEdit}
        onDelete={onDelete}
        mode={mode}
        t={t}
      />

      <div className="w-1/3 h-full items-center justify-center hidden sm:flex overflow-hidden">
        <ActivityImage image={image} id={id} t={t} />
      </div>

      <div className="w-2/3 flex flex-col h-full">
        <div className="flex-1 overflow-hidden pb-6">
          <h1 className="font-bold text-secondary text-sm pr-14 line-clamp-2">{title}</h1>
          <p className={`text-sm mt-2 text-gray-600 break-words ${type ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {description}
          </p>
          {category && <span className="badge badge-primary mt-1">{category}</span>}
          {metadata?.is_restricted && (
            <span className="badge badge-outline mt-1">
              {metadata.registered} / {metadata.slots} {t('activities.slots.title')}
            </span>
          )}
        </div>
        {/* Type badge */}
        {typeObj && (
          <div className="flex">
            <span className="badge rounded-xl" style={getBadgeStyle(typeObj)}>
              {typeObj.type}
            </span>
          </div>
        )}
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
  metadata: null
};
