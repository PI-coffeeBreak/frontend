import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export function PageTitleInput({ title, onChange }) {
    const { t } = useTranslation();
    
    return (
        <div className="mb-4">
            <label htmlFor="page-title" className="block text-sm font-medium text-gray-700">
                {t('components.pageTitleInput.label')}
            </label>
            <input
                id="page-title"
                type="text"
                value={title}
                onChange={(e) => onChange(e.target.value)}
                className="input mt-1 block w-full p-2 border border-gray-300 rounded-xl"
                placeholder={t('pageEditor.common.titlePlaceholder')}
            />
        </div>
    );
}

PageTitleInput.propTypes = {
    title: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}; 