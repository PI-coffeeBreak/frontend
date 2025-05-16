import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';

export function AlertFilters({ 
  searchQuery, 
  onSearchChange 
}) {
  return (
    <div className="flex mt-4 gap-4">
      <div>
        <label className="input input-bordered rounded-xl flex items-center gap-2">
          <FaSearch className="text-gray-400"/>
          <input
              type="text"
              className="grow"
              placeholder="Search templates"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

AlertFilters.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired
}; 