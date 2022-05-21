interface Props {
  [prop: string]: unknown
}

// https://iconmonstr.com/file-9-svg/
const File = (props: Props): JSX.Element => (
  <svg viewBox="0 0 24 24" width="1rem" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M15.602 4.075c2.201 1.174 4.904 3.254 6.398 5.252-1.286-.9-3.011-1.027-5.058-.549.222-1.469-.185-3.535-1.34-4.703zm-.825 6.925s1.522-7-3.335-7h-5.442v20h16v-10.629c0-3.42-4.214-3.116-7.223-2.371zm-.777-9l-3-2h-9v22h2v-20h10z" />
  </svg>
)

export default File
