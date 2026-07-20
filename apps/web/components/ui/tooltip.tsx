import * as React from "react"
export const Tooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => <div ref={ref} {...props} />)
Tooltip.displayName = "Tooltip"
