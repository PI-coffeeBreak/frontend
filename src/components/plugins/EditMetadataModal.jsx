// EditMetadataModal.jsx
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { useNotification } from "../../contexts/NotificationContext";
import axios from "axios";

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
    } catch (err) {
      // If metadata not found, just keep defaults
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
      onClose();
    } catch (error) {
      console.error(error);
      showNotification("Erro ao atualizar os metadados", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Limites de Vagas">
      {isLoading ? (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRestricted}
                  onChange={(e) => setIsRestricted(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
                Limitar número de vagas
              </label>
            </div>
            {isRestricted && (
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
                />
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn">
              Cancelar
            </button>
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
