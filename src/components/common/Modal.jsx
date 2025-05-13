import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export function Modal({ isOpen, onClose, title, description, children }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current;
  
    const handleEscapeKey = (e) => {
      const activeElement = document.activeElement;
      const isFormElement =
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT';
  
      if (e.key === 'Escape' && !isFormElement) {
        onClose();
      }
    };
  
    if (isOpen) {
      modal?.showModal();
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      modal?.close();
      document.body.classList.remove('modal-open');
    }
  
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // Só remove `modal-open` se ainda estiver presente
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
      }
    };
  }, [isOpen, onClose]);
  

  return (
    <dialog
      ref={modalRef}
      className="modal rounded-md"
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
          className="btn rounded-xl absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mt-4">{children}</div>
      </div>

      <button 
        className="modal-backdrop"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
        aria-label="Close modal"
        tabIndex={0}
      />
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