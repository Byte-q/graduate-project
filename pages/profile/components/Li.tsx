import Link from 'next/link'
import React from 'react'

export default function Li(href: string, label: string): React.JSX.Element {
  return (
    <li className="mb-2">
      <Link href={href} title={label} className="text-blue-600 hover:underline">
        {label}
      </Link>
    </li>
  )
}
