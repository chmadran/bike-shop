import Image from 'next/image'

type V0LogoProps = {
  size?: number
  className?: string
}

export function V0Logo({ size = 24, className }: V0LogoProps) {
  return (
    <Image
      src="/icon.svg"
      alt="v0"
      width={size}
      height={size}
      className={className}
    />
  )
}
