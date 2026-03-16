import './App.css'
import { FaAndroid, FaGithub } from 'react-icons/fa'
import PeopleCounter from './components/PeopleCounter'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex flex-col">
      <header className="max-w-4xl mx-auto px-4 pt-7 md:pt-10">
          {/* Center the h1 */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 text-center">People Counter</h1>
        <p className="mt-1 text-slate-600">Count people in images locally on your device.</p>
      </header>

      <main className="flex-1">
        <PeopleCounter />
      </main>

      <footer className="max-w-4xl w-full mx-auto px-4 pb-6 pt-2 md:pb-10">
        <div className="px-1 py-3 flex justify-center border-t border-slate-200/80">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <a
              href="https://play.google.com/store/apps/details?id=com.people.counter"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-slate-700 transition-colors"
            >
              <FaAndroid className="h-4 w-4 text-accent/80" />
              Android App
            </a>
            <a
              href="https://github.com/StefanObie/PeopleCounterWeb"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-slate-700 transition-colors"
            >
              <FaGithub className="h-4 w-4 text-slate-500" />
              GitHub Project
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
