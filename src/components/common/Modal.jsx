import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export function Modal({ isOpen, onClose, title, description, children }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      document.body.classList.add('modal-open');
      
      // Don't automatically focus the close button - this can cause issues with forms
      // closeButtonRef.current?.focus();
      
      // This is the problematic code that needs to be fixed:
      const handleEscapeKey = (e) => {
        // Check if the active element is a form element before handling Escape
        const activeElement = document.activeElement;
        const isFormElement = 
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' || 
          activeElement.tagName === 'SELECT';
        
        // Only handle Escape if not in a form element
        if (e.key === 'Escape' && !isFormElement) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscapeKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    } else {
      modalRef.current?.close();
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  return (
    <dialog
      ref={modalRef}
      className="modal"
      onClose={() => onClose()}
      onCancel={(e) => {
        // Prevent default dialog behavior on cancel (when ESC is pressed)
        e.preventDefault(); 
      }}
    >
      <div className="modal-box max-w-2xl">
        <div className="mb-6">
          <h3 className="font-bold text-lg">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>

        <button
          ref={closeButtonRef}
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mt-4">{children}</div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </dialog>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired
};