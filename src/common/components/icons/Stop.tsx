interface Props {
  [prop: string]: unknown
}

/**
 * {@link https://iconmonstr.com/media-control-50-svg/}
 */
const Stop = (props: Props): JSX.Element => (
  <svg className="w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 2h20v20h-20z" />
  </svg>
)

export default Stop
