interface Props {
  [prop: string]: unknown
}

// https://iconmonstr.com/arrow-1-svg/
const Arrow = (props: Props): JSX.Element => (
  <svg className="w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M13 7v-6l11 11-11 11v-6h-13v-10z" />
  </svg>
)

export default Arrow
