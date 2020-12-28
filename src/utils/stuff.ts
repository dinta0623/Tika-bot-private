export const intoArray = (x: any) => (Array.isArray(x) ? x : [x])

export const intoCallable = (thing: any) => {
  if (typeof thing === 'function') {
    return thing
  }
  return () => thing
}
