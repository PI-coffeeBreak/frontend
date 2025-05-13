import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export function PageDescriptionInput({ description, onChange }) {
    const { t } = useTranslation();
    
    return (
        <div className="mb-4">
            <label htmlFor="page-description" className="block text-sm font-medium text-gray-700">
                {t('components.pageDescriptionInput.label')}
            </label>
            <textarea
                id="page-description"
                value={description}
                onChange={(e) => onChange(e.target.value)}
                className="textarea mt-1 block w-full p-2 border border-gray-300 rounded-xl"
                placeholder={t('pageEditor.common.descriptionPlaceholder')}
            />
        </div>
    );
}

PageDescriptionInput.propTypes = {
    description: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};