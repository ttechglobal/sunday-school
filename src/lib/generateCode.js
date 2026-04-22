export function generateClassCode() {
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const digits  = '23456789'

  const r = (arr) => arr[Math.floor(Math.random() * arr.length)]

  return (
    r(letters) + r(letters) + r(letters) +
    r(digits)  + r(digits)  + r(digits)  +
    r(letters) +
    r(digits)
  )
}