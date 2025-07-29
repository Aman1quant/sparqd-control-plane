import React, { forwardRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { BsCalendar } from "react-icons/bs"
import styles from "./DatePicker.module.scss"

interface CustomDatePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  label?: string
  showLabel?: boolean
  dateFormat?: string
  placeholderText?: string
  isClearable?: boolean
  showMonthDropdown?: boolean
  showYearDropdown?: boolean
  dropdownMode?: "select" | "scroll"
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  showTimeSelect?: boolean
  [key: string]: any
}

interface CustomInputProps {
  value?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, className, disabled, placeholder }, ref) => (
    <div className={styles["custom-datepicker-input"]}>
      <BsCalendar className={styles["calendar-icon"]} />
      <input
        className={`${styles["input-field"]} ${className ?? ""} ${
          disabled ? styles.disabled : ""
        }`}
        value={value}
        onClick={onClick}
        ref={ref}
        readOnly
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  ),
)

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selected,
  onChange,
  label,
  showLabel = false,
  dateFormat = "MMM d, yyyy hh:mm aa",
  placeholderText = "Select date and time",
  isClearable = false,
  showMonthDropdown = true,
  showYearDropdown = true,
  dropdownMode = "select",
  disabled = false,
  minDate,
  maxDate,
  className = "",
  showTimeSelect = true,
  ...props
}) => {
  return (
    <div className={styles["datepicker-container"]}>
      {showLabel && label && (
        <label className={styles["datepicker-label"]}>{label}</label>
      )}
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        isClearable={isClearable}
        showMonthDropdown={showMonthDropdown}
        showYearDropdown={showYearDropdown}
        dropdownMode={dropdownMode}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        customInput={<CustomInput />}
        showTimeSelect={showTimeSelect}
        placeholderText={placeholderText}
        className={className}
        popperPlacement="bottom-end"
        {...props}
      />
    </div>
  )
}

export default CustomDatePicker
