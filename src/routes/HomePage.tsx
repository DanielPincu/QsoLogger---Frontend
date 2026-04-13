import { Link } from 'react-router-dom'

export default function homePage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Home</h1>

      <Link
        to="/about"
        className="text-red-900 hover:underline"
      >
        Go to About
      </Link>

      <Link
        to="/contact"
        className="text-red-900 hover:underline"
      >
        Go to Contact
      </Link>
    </div>
  )
}