import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";
import './landing_page/css/App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {/* Your page content goes here */}
      </main>
      <Footer />
    </div>
  );
}

export default App;