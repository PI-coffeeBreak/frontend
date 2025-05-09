import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useMedia } from '../../contexts/MediaContext.jsx';

export default function Activity({ id, title, description, image, category, type, onDelete, onEdit, mode }) {
  const { t } = useTranslation();
  const { getMediaUrl } = useMedia();
  const [imageUrl, setImageUrl] = useState(image);

  useEffect(() => {
    if (image) {
      const isImageLink = image.startsWith('http');
      setImageUrl(isImageLink ? image : getMediaUrl(image));
    }
  }, [image]);

  return (
    <div
      className="fc-event cursor-pointer flex items-center w-full gap-4 h-36 p-4 bg-white shadow-md rounded-md relative"
      data-id={id}
      data-title={title}
    >
      {mode === 'edit' && onEdit && (
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

      {mode === 'delete' && onDelete && (
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

      <div className="w-1/3 h-full items-center justify-center hidden sm:block">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={t('activities.imageAlt')}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class='w-full h-full bg-gray-200 rounded-md flex items-center justify-center'>
                  <span class='text-gray-400'>${t('activities.noImage')}</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-400">{t('activities.noImage')}</span>
          </div>
        )}
      </div>

      <div className="w-2/3">
        <h1 className="font-bold text-secondary text-sm">{title}</h1>
        <p className="text-sm mt-2 text-gray-600">{description}</p>
        <div className="mt-1 flex">
          <span className="badge badge-secondary">{type}</span>
          {category && <span className="badge ml-2 badge-primary">{category}</span>}
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
  mode: PropTypes.oneOf(['edit', 'delete'])
};

Activity.defaultProps = {
  description: '',
  image: '',
  category: '',
  onDelete: null,
  onEdit: null,
  mode: 'delete'
};
