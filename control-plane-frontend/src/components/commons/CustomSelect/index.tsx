import React from "react"
import ReactSelect, { components } from "react-select"
import clsx from "clsx"
import styles from "./CustomSelect.module.scss"
import { BsChevronDown } from "react-icons/bs"

interface Option {
  value: string | number
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: Option | null
  onChange: (option: Option | null) => void
  placeholder?: string
  className?: string
  isClearable?: boolean
  isDisabled?: boolean
}

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <BsChevronDown className={styles.dropdownIcon} />
    </components.DropdownIndicator>
  )
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  isClearable = true,
  isDisabled = false,
}) => {
  return (
    <div className={clsx(styles.selectContainer, className)}>
      <ReactSelect
        classNamePrefix="custom-select"
        className={styles.reactSelect}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        components={{ DropdownIndicator }}
      />
    </div>
  )
}

export default CustomSelect
