import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import axios from "axios";
import { FaTimes } from "react-icons/fa";

export default function EditMetadataModal({ isOpen, onClose, activityId }) {
  const { showNotification } = useNotification();
  const [isRestricted, setIsRestricted] = useState(false);
  const [slots, setSlots] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activityId && isOpen) {
      fetchMetadata();
    }
  }, [activityId, isOpen]);

  const fetchMetadata = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/register/metadata/${activityId}`);
      setIsRestricted(res.data.is_restricted);
      setSlots(res.data.slots);
    } catch {
      setIsRestricted(false);
      setSlots(0);
      showNotification("Esta atividade ainda não tem metadados definidos.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`/api/register/metadata/${activityId}`, {
        is_restricted: isRestricted,
        slots: parseInt(slots, 10)
      });
      showNotification("Metadados atualizados com sucesso", "success");
      onClose(); // <- estado será atualizado corretamente
    } catch (error) {
      console.error(error);
      showNotification("Erro ao atualizar os metadados", "error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex justify-between items-center w-full">
          <span>Editar Limites de Vagas</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-error p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-error"
            type="button"
            aria-label="Fechar"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRestricted}
                  onChange={(e) => setIsRestricted(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                Limitar número de vagas
              </label>

              <div>
                <label htmlFor="slots" className="block text-sm font-medium mb-1">
                  Número máximo de participantes
                </label>
                <input
                  type="number"
                  id="slots"
                  value={slots}
                  onChange={(e) => setSlots(e.target.value)}
                  className="input input-bordered w-full"
                  min={0}
                  disabled={!isRestricted}
                  placeholder="ex: 50"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

EditMetadataModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activityId: PropTypes.number.isRequired
};
