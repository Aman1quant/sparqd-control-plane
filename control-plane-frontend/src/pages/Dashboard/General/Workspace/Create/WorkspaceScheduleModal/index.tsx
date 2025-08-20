import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Select, TextInput, Checkbox } from '@components/commons';
import { IconX, IconChevronDown } from '@tabler/icons-react';
import styles from './WorkspaceScheduleModal.module.scss';
import clsx from 'clsx';

interface WorkspaceScheduleModalProps {
  onClose: () => void;
  title: string;
}

const WorkspaceScheduleModal: React.FC<WorkspaceScheduleModalProps> = ({ onClose, title }) => {
  const [activeTab, setActiveTab] = useState('Simple');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // const scheduleOptions = [{ value: 'daily', label: 'Day' }];
  // const computeOptions = [{ value: 'serverless', label: 'Serverless' }];
  // const performanceOptions = [{ value: 'optimized', label: 'Performance optimized' }];

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>New schedule</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <IconX size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <TextInput
            label="Job name*"
            placeholder="Enter a name for this job"
            value={title}
          />

          <div className={styles.tabContainer}>
            <button
              className={clsx(styles.tabButton, activeTab === 'Simple' && styles.active)}
              onClick={() => setActiveTab('Simple')}
            >
              Simple
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'Advanced' && styles.active)}
              onClick={() => setActiveTab('Advanced')}
            >
              Advanced
            </button>
          </div>

          {activeTab === 'Simple' && (
            <div className={styles.tabContent}>
              {/* Schedule Section */}
              <div className={styles.fieldGroup}>
                <label className={styles.groupLabel}>Schedule</label>
                <div className="flex items-center gap-2">
                  <span>Every</span>
                  <TextInput type="number" value={1} onChange={() => {}} className="w-20" />
                  <Select
                    options={[{ value: 'day', label: 'Day' }]}
                    value="day"
                    onChange={() => {}}
                    className="w-32"
                  />
                </div>
              </div>

              {/* Compute Section */}
              <div className={styles.fieldGroup}>
                <label className={styles.groupLabel}>Compute*</label>
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    options={[{ value: 'serverless', label: 'Serverless' }]}
                    value="serverless"
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Performance Optimization Section */}
              <div className={styles.fieldGroup}>
                <label className={styles.groupLabel}>Performance optimization</label>
                <Checkbox
                  label="Performance optimized"
                  checked={false}
                  onChange={() => {}}
                />
              </div>
            </div>
          )}

          {activeTab === 'Advanced' && (
            <div className={styles.tabContent}>
              <div className={styles.fieldGroup}>
                <label className={styles.groupLabel}>Schedule</label>
                <div className="flex items-center gap-2">
                  <span>Every</span>
                  <Select
                    options={[{ value: 'day', label: 'Day' }]}
                    value="day"
                    onChange={() => {}}
                    className="w-32"
                  />
                  <span>at</span>
                  <Select
                    options={Array.from({ length: 24 }, (_, i) => ({
                      value: i.toString().padStart(2, '0'),
                      label: i.toString().padStart(2, '0'),
                    }))}
                    value="12"
                    onChange={() => {}}
                    className="w-20"
                  />
                  <span>:</span>
                  <Select
                    options={Array.from({ length: 60 }, (_, i) => ({
                      value: i.toString().padStart(2, '0'),
                      label: i.toString().padStart(2, '0'),
                    }))}
                    value="06"
                    onChange={() => {}}
                    className="w-20"
                  />
                </div>
                <div className="mt-2">
                  <Checkbox label="Show cron syntax" checked={false} onChange={() => {}} />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.groupLabel}>Timezone</label>
                <Select
                  options={[
                    { value: 'utc', label: '(UTC+00:00) UTC' },
                    // Tambahkan opsi timezone lain jika perlu
                  ]}
                  value="utc"
                  onChange={() => {}}
                  className="w-full"
                />
              </div>

              {/* Compute Section */}
              <div className={styles.fieldGroup}>
                <label className={styles.groupLabel}>Compute*</label>
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    options={[{ value: 'serverless', label: 'Serverless' }]}
                    value="serverless"
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Performance Optimization Section */}
              <div className={styles.fieldGroup}>
                <label className={styles.groupLabel}>Performance optimization</label>
                <Checkbox
                  label="Performance optimized"
                  checked={false}
                  onChange={() => {}}
                />
              </div>
            </div>
          )}

          <div className={styles.moreOptions}>
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={styles.moreOptionsHeader}
            >
              <span>More options</span>
              <IconChevronDown className={clsx(styles.chevron, isOptionsOpen && styles.rotated)} />
            </button>

            {isOptionsOpen && (
              <div className={styles.moreOptionsContent}>
                {/* Notifications */}
                <div className={styles.fieldGroup}>
                  <label className={styles.groupLabel}>Notifications</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <TextInput
                        value="cryanfajri24@gmail.com"
                        onChange={() => {}}
                        placeholder="Enter email"
                        className="w-80"
                      />
                      <Checkbox label="Start" checked={false} onChange={() => {}} />
                      <Checkbox label="Success" checked={false} onChange={() => {}} />
                      <Checkbox label="Failure" checked={true} onChange={() => {}} />
                      <button
                        type="button"
                        className="text-red-500 hover:underline"
                        onClick={() => {}}
                      >
                        🗑️
                      </button>
                    </div>
                    <div>
                      <button type="button" className="text-blue-400 text-sm hover:underline">
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                <div className={styles.fieldGroup}>
                  <label className={styles.groupLabel}>Parameters</label>
                  <button type="button" className="text-blue-400 text-sm hover:underline">
                    + Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Button label="Cancel" variant="outline" color="primary" onClick={onClose} />
          <Button label="Create" variant="solid" color="primary" onClick={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WorkspaceScheduleModal;
