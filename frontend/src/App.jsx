import Header from './components/Header';
import Home from './pages/home';
import Reservations from './pages/Reservations';
import Help from './pages/Help';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-0">
        <Home />
        <Reservations />
        <Help />
        <ContactUs />
      </main>
    </div>
  );
}

export default App;
