import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export function Modal({ isOpen, onClose, title, description, children }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
      document.body.classList.add('modal-open');
      
      // Focus the close button when modal opens for keyboard accessibility
      closeButtonRef.current?.focus();
      
      // Add event listener to document or window instead of the dialog element
      const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      // Add the event listener to the document
      document.addEventListener('keydown', handleEscapeKey);
      
      // Clean up function
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
    >
      <div className="modal-box max-w-2xl">
        <button 
          ref={closeButtonRef}
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Close dialog"
          type="button"
        >
          ✕
        </button>
        
        <h3 className="font-bold text-lg" id="dialog-title">{title}</h3>
        
        {description && (
          <p className="py-4" id="dialog-description">{description}</p>
        )}
        
        {children}
      </div>
      
      <form 
        method="dialog" 
        className="modal-backdrop"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <button 
          type="submit"
          className="w-full h-full cursor-default"
          aria-label="Close dialog"
        >
          <span className="sr-only">Close dialog</span>
        </button>
      </form>
    </dialog>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node
};