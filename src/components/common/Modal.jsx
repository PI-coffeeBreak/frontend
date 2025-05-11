import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export function Modal({ isOpen, onClose, title, description, children, size = "default" }) {
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
      // Only remove 'modal-open' if it's still present
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
      }
    };
  }, [isOpen, onClose]);

const getModalStyles = () => {
  if (size === 'compact') {
    return {
      boxClass: "modal-box max-w-3xl p-5",
      headerClass: "mb-4",
      titleClass: "font-medium text-lg",
      closeButtonClass: "btn btn-sm absolute right-3 top-3",
      contentClass: "mt-3"
    };
  }

  return {
    boxClass: "modal-box max-w-2xl",
    headerClass: "mb-6",
    titleClass: "font-bold text-lg",
    closeButtonClass: "btn absolute right-2 top-2",
    contentClass: "mt-4"
  };
};

  const styles = getModalStyles();

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
      <div className={styles.boxClass}>
        <div className={styles.headerClass}>
          <h3 className={styles.titleClass}>{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>

        <button
          ref={closeButtonRef}
          className={styles.closeButtonClass}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className={styles.contentClass}>{children}</div>
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
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['default', 'compact'])
};