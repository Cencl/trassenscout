import { ArrowDownTrayIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid"
import { PencilIcon } from "@heroicons/react/24/outline"
import { RouteUrlObject } from "blitz"
import clsx from "clsx"
import NextLink from "next/link"
import { forwardRef } from "react"
import { selectParticipationLinkStyle } from "./styles"

// the link component is duplicated to avoid dependencies between TS and 'Beteiligung'

export type ParticipationLinkProps = {
  href: RouteUrlObject | string
  className?: string
  classNameOverwrites?: string
  /** @default `false` */
  blank?: boolean
  /** @desc Style Link as Button */
  button?: true | "white" | "pink"
  icon?: keyof typeof icons
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

const icons = {
  plus: <PlusIcon className="h-4 w-4 pb-0.5" />,
  edit: <PencilIcon className="h-4 w-4 pb-0.5" />,
  download: <ArrowDownTrayIcon className="h-4 w-4 pb-0.5" />,
  delete: <TrashIcon className="h-4 w-4 pb-0.5" />,
}

export const ParticipationLink: React.FC<ParticipationLinkProps> = forwardRef<
  HTMLAnchorElement,
  ParticipationLinkProps
>(
  (
    { href, className, classNameOverwrites, children, blank = false, button, icon, ...props },
    ref
  ) => {
    const classNames = clsx(
      { "gap-1 inline-flex justify-center items-center": icon }, // base styles for icon case
      { "pl-5 ": icon && button }, // overwrites to `buttonBase` for icon case
      classNameOverwrites ?? selectParticipationLinkStyle(button, className)
    )

    // external link
    if (typeof href === "string") {
      return (
        <a
          ref={ref}
          href={href}
          className={classNames}
          rel="noopener noreferrer"
          {...{ target: blank ? "_blank" : undefined }}
          {...props}
        >
          {icon && icons[icon]}
          {children}
        </a>
      )
    }

    return (
      <NextLink href={href}>
        {/*
          TODO remove a-tag one React 13 can be used.
          Also, update the `ref`, `{...props}`, see https://headlessui.com/react/menu#integrating-with-next-js
        */}
        <a
          ref={ref}
          className={classNames}
          {...props}
          {...{ target: blank ? "_blank" : undefined }}
        >
          {icon && icons[icon]}
          {children}
        </a>
      </NextLink>
    )
  }
)
