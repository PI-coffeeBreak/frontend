import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-selector">
      <button 
        onClick={() => changeLanguage('pt-PT')} 
        className={i18n.language === 'pt-PT' ? 'active' : ''}
      >
        PT-PT
      </button>
      <button 
        onClick={() => changeLanguage('pt-BR')} 
        className={i18n.language === 'pt-BR' ? 'active' : ''}
      >
        PT-BR
      </button>
      <button 
        onClick={() => changeLanguage('en')} 
        className={i18n.language === 'en' ? 'active' : ''}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector; 