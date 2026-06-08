import { FaFilm } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-film-dark-900 border-t border-film-red-500/20 py-8 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FaFilm className="text-film-red-500 text-xl" />
          <h3 className="font-bold text-lg">Film<span className="text-film-red-500">Stars</span></h3>
        </div>
        
      </div>
    </footer>
  )
}

export default Footer
