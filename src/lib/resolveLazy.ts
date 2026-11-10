import type { ComponentType, LazyExoticComponent } from 'react'

type LazyPayload = {
  _status: number
  _result: unknown
}

type LazyType = LazyExoticComponent<ComponentType> & { _payload: LazyPayload }

/** Mark a React.lazy() module resolved so renderToString / hydrateRoot do not suspend. */
export async function resolveLazy(
  type: LazyExoticComponent<ComponentType>,
): Promise<void> {
  const payload = (type as LazyType)._payload
  if (!payload || payload._status === 1) return
  if (payload._status === -1) {
    const factory = payload._result as () => Promise<{ default: ComponentType }>
    const thenable = factory()
    payload._status = 0
    payload._result = thenable
    const mod = await thenable
    payload._status = 1
    payload._result = mod
    return
  }
  if (payload._status === 0) {
    const mod = await (payload._result as Promise<{ default: ComponentType }>)
    payload._status = 1
    payload._result = mod
  }
}
