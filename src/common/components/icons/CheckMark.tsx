interface Props {
  [prop: string]: unknown
}

/**
 * {@link https://iconmonstr.com/check-mark-1-svg/}
 */
const CheckMark = (props: Props): JSX.Element => (
  <svg className="w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
  </svg>
)

export default CheckMark
