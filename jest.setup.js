// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = () => 'blob:mock'
}

if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = () => {}
}
