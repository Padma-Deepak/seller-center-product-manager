import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import FloatingWidgets from './components/layout/FloatingWidgets'
import ProductManagerPage from './pages/ProductManagerPage'

export default function App() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Header />
        <ProductManagerPage />
      </div>
      <FloatingWidgets />
    </div>
  )
}
