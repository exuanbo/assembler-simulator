interface Props {
  [prop: string]: unknown
}

// https://iconmonstr.com/arrow-65-svg/
const ArrowDown = (props: Props): JSX.Element => (
  <svg className="w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
  </svg>
)

export default ArrowDown
