import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Hero from "./components/Hero";

const App = () => {
  return (
    <div>
      App
      <Navbar />
      <Header />
      <Hero title="Welcome to BloomSpace" subtitle="Your productivity companion for ADHD"/>
    </div>
  );
};

export default App;