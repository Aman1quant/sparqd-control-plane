import styles from "../Dashboard.module.scss"
import imgChart1 from "@/images/chart_1.svg"
import imgChart2 from "@/images/chart_2.svg"
import imgChart3 from "@/images/chart_3.svg"

const Template = () => {
  return (
    <div className={styles.dashboardTemplate}>
      <div className="border border-black-100 rounded-lg">
        <img
          src={imgChart1}
          className={styles.imgTemplate}
          alt="templateImage"
        />
        <div className="text-body-small p-2">
          <div className="text-black font-medium">New Dashboard Report</div>
          <label className="text-black-300">kazi.alam@mediacorp.sg</label>
        </div>
      </div>

      <div className="border border-black-100 rounded-lg">
        <img
          src={imgChart2}
          className={styles.imgTemplate}
          alt="templateImage"
        />
        <div className="text-body-small p-2">
          <div className="text-black font-medium">
            Big Kahuna Burgers Analysis
          </div>
          <label className="text-black-400 bg-black-50 rounded-md px-1">
            Classic
          </label>
        </div>
      </div>

      <div className="border border-black-100 rounded-lg">
        <img
          src={imgChart3}
          className={styles.imgTemplate}
          alt="templateImage"
        />
        <div className="text-body-small p-2">
          <div className="text-black font-medium">
            Big Kahuna Burgers Analysis
          </div>
          <label className="text-black-400 bg-black-50 rounded-md px-1">
            Classic
          </label>
        </div>
      </div>
    </div>
  )
}

export default Template
