import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <nav className="flex justify-between items-center py-6 px-10">
        <h1 className="text-2xl font-bold text-blue-500 tracking-tight">FinanceTracker</h1>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-white transition font-medium">
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition font-medium shadow-lg shadow-blue-900/20"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center pt-20 text-center px-4">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
          Your financial success <br />
          <span className="text-blue-500">starts here</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl">
          Observe your investments,analyze portfolio and take the best financial dicesion with our treker.
        </p>

        <div className="flex gap-4">
          <Link
            to="/register"
            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-xl hover:shadow-blue-500/20"
          >
            Start for free
          </Link>
        </div>
      </main>

      <section className="grid md:grid-cols-3 gap-8 p-20 mt-10">
        {[
          { title: 'Portfolio', desc: 'Control all your assets in one place.' },
          { title: 'Analyze', desc: 'PnL and ROI with calculation in real time.' },
          { title: 'Watchlist', desc: 'Observe stock and add favourable assets.' },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 transition"
          >
            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
            <p className="text-slate-400">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default LandingPage
