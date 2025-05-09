import PropTypes from 'prop-types';

export const CheckboxInput = ({ label, name, checked, onChange }) => (
    <label className="flex items-center gap-2">
        <input
            type="checkbox"
            name={name}
            checked={checked || false}
            onChange={onChange}
            className="checkbox checkbox-primary"
        />
        <span className="text-xs font-medium text-gray-700">{label}</span>
    </label>
);

CheckboxInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};