import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, TextInput } from '@components/commons';
import { IconX } from '@tabler/icons-react';
import styles from './SQLRenameTabModal.module.scss';
import { useQuery } from '@context/query/QueryContext';

interface SQLRenameTabModalProps {
  tabId: string;
  currentName: string;
  onClose: () => void;
}

const SQLRenameTabModal: React.FC<SQLRenameTabModalProps> = ({ tabId, currentName, onClose }) => {
  const { renameTab } = useQuery();
  const [newName, setNewName] = useState(currentName);

  const handleSave = () => {
    if (newName.trim()) {
      renameTab(tabId, newName.trim());
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Rename Tab</h2>
          <button onClick={onClose} className={styles.modalCloseButton}>
            <IconX size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <TextInput
            label="Tab Name"
            value={newName}
            onChange={setNewName}
            autoFocus
          />
        </div>
        <div className={styles.modalFooter}>
          <Button label="Cancel" variant="outline" color="primary" onClick={onClose} />
          <Button label="Save" variant="solid" color="primary" onClick={handleSave} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SQLRenameTabModal;