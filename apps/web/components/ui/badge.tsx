import * as React from "react"
export const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => <div ref={ref} {...props} />)
Badge.displayName = "Badge"
