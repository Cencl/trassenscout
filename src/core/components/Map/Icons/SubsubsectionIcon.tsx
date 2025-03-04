type Props = React.HTMLAttributes<HTMLDivElement> & {
  label: string
}

export const SubsubsectionIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-9 w-auto flex-none
        items-center justify-center rounded-lg
        border-2 border-gray-900 bg-white px-1.5
        font-sans text-xl font-bold leading-none text-gray-900`}
    {...props}
  >
    {label}
  </div>
)

export const SubsubsectionMapIcon: React.FC<Props> = ({ label, ...props }) => (
  <div
    className={`flex h-5 w-auto flex-none
        items-center justify-center rounded-md
        border-2 border-gray-900 bg-white px-1.5
        font-sans text-xs font-bold leading-none text-gray-900`}
    {...props}
  >
    {label}
  </div>
)
