import Hero from "./Hero"
import Offer from "./Offer"
import Features from "./Features"
import Footer from '../../components/layout/Footer';

const Home = () => {
  return (
    <div>
      {/* home section */}
      <section id="home">
        <Hero />
      </section>
      <section id="shop">
        <Offer />
      </section>
      {/* Features section */}
      <section id="features">
        <Features />
      </section>
    </div>
  );
};

export default Home;
