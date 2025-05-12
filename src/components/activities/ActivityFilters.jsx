import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { FaSearch } from 'react-icons/fa';

export function ActivityFilters({ 
  activityTypes, 
  searchQuery, 
  onSearchChange,
  selectedType,
  onTypeChange 
}) {
  const { t } = useTranslation();

  const handleResetFilters = () => {
    onTypeChange("");
  };

  return (
      <div className="flex mt-4 gap-4">
        <div>
          <label className="input input-bordered rounded-xl flex items-center gap-2">
            <FaSearch className="text-gray-400"/>
            <input
                type="text"
                className="grow"
                placeholder={t('activities.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>
        </div>
        <div className="filter">
          <input 
            className="btn rounded-xl mr-2 filter-reset"
            type="radio" 
            onClick={handleResetFilters} 
            name="metaframeworks" 
            aria-label={t('activities.filters.all')}
          />
          {activityTypes.map((type) => (
            <input 
              key={type.id}
              className="btn rounded-xl"
              type="radio" 
              name="metaframeworks" 
              onClick={() => onTypeChange(type.id.toString())} 
              aria-label={type.type}
              style={{
                backgroundColor: type.color || '#3788d8',
                borderColor: type.color || '#3788d8',
                color: '#ffffff'
              }}
            />
          ))}
        </div>
      </div>
  );
}

ActivityFilters.propTypes = {
  activityTypes: PropTypes.array.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedType: PropTypes.string.isRequired,
  onTypeChange: PropTypes.func.isRequired
};