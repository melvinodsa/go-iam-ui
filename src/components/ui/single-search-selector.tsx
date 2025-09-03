import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import React, { useState, useEffect, useCallback } from "react"
import { Search } from "lucide-react"

interface Option {
  label: string
  value: string
}

interface SingleSearchSelectorSelectorProps {
  onSelect: (selected: string) => void
  loadOptions: (search: string) => void
  options: Option[]
  title?: string
}

function SingleSearchSelector({
  onSelect,
  loadOptions,
  options = [],
  title = "Select Item",
}: SingleSearchSelectorSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchOptions = useCallback(
    (query: string) => {
      setLoading(true)
      loadOptions(query)
    },
    [loadOptions]
  )

  useEffect(() => {
    if (options) {
      setLoading(false)
    }
  }, [options])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOptions(search)
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [search])

  const toggleSelect = (value: string) => {
    onSelect(value)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <Search className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="mt-2"
        />

        <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1">
          {loading && <div className="text-sm text-muted-foreground px-2">Loading...</div>}

          {!loading && options.length === 0 && (
            <div className="text-sm text-muted-foreground px-2">No results</div>
          )}

          {!loading &&
            options.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center space-x-2 px-2 py-1 hover:bg-muted rounded cursor-pointer"
                onClick={() => toggleSelect(opt.value)}
              >
                <span>{opt.label}</span>
              </div>
            ))}
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default React.memo(SingleSearchSelector);