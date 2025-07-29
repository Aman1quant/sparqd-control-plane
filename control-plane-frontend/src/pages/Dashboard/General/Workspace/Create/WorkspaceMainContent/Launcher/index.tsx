import { BsJournalText, BsTerminal, BsFileEarmarkPlus } from "react-icons/bs"
import styles from "./Launcher.module.scss"

const WorkspaceLauncher = ({ onOpen }: { onOpen: (type: string) => void }) => {
  const tiles = [
    { label: "Notebook", icon: <BsJournalText />, type: "notebook" },
    { label: "Console", icon: <BsTerminal />, type: "console" },
    { label: "Blank File", icon: <BsFileEarmarkPlus />, type: "blank" },
  ]

  return (
    <div className={styles.launcherWrapper}>
      <h2 className={styles.sectionTitle}>Launcher</h2>
      <div className={styles.tilesWrapper}>
        {tiles.map(({ label, icon, type }) => (
          <div key={type} className={styles.tile} onClick={() => onOpen(type)}>
            <div className={styles.icon}>{icon}</div>
            <div className={styles.label}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WorkspaceLauncher
