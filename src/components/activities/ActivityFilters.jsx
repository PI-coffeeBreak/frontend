import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';

export function ActivityFilters({ 
  activityTypes, 
  searchQuery, 
  onSearchChange, 
  selectedType, 
  onTypeChange 
}) {
  const handleResetFilters = () => {
    onTypeChange("");
  };

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <div className="flex-grow max-w-md">
        <label className="input input-bordered flex items-center gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            className="grow"
            placeholder="Search activities by name or description"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>

      <div className="flex-shrink-0">
        <div className="join">
          <button 
            className="btn join-item btn-sm" 
            onClick={handleResetFilters}
            disabled={!selectedType}
          >
            Clear
          </button>
          
          {activityTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`btn btn-sm join-item ${selectedType === type.id.toString() ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onTypeChange(type.id.toString())}
            >
              {type.type}
            </button>
          ))}
        </div>
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