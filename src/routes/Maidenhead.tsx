import Nav from '../components/Nav'

export default function About() {
  return (
    <div className="w-full p-4">
       <Nav />
       <h2 className="text-2xl font-bold mb-4">World Map Maidenhead Locator
        <span className='text-red-500'> Thanks to radio operator: EI8IC</span>
       </h2>

      {/* Try embedding external grid map */}
      <div className="w-full h-[80vh] border rounded overflow-hidden mb-4">
        <iframe
          src="https://www.mapability.com/ei8ic/maps/gridworld2.php"
          className="w-full h-full border-0"
          title="Maidenhead Grid Map"
        />
      </div>

      {/* Fallback link if iframe is blocked */}
      <div>
        <p className="text-gray-600 mb-2">
          If the map does not load, open it directly:
        </p>
        <a
          href="https://www.mapability.com/ei8ic/maps/gridworld2.php"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Open Grid Map
        </a>
      </div>
    </div>
  )
}