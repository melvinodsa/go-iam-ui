import { hookstate, type State, useHookstate } from "@hookstate/core"

export interface Page {
    name: string
    location: string
    section?: string
}

interface NavState {
    pages: Page[]
}

const state = hookstate<NavState>({
    pages: [{ name: 'Home', location: '/' }]
})

const wrapState = (state: State<NavState>) => ({
    setPage: (page: Page) => {
        state.pages.set([page])
    },
    setPages: (pages: Page[]) => {
        state.pages.set(pages)
    },
    pushPage: (page: Page) => {
        state.pages.set([...JSON.parse(JSON.stringify(state.pages.value)), page])
    },
    pages: state.pages.value,
    path: state.path.values,
})


export const useNavState = () => wrapState(useHookstate(state))