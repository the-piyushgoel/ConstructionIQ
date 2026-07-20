import * as React from "react"
export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>((props, ref) => <table ref={ref} {...props} />)
Table.displayName = "Table"
