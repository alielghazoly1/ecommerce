import Features from "../components/Features"
import Hero from "../components/Hero"
import Offer from "../components/Offer"
import Footer from "../components/Footer"
import HeroRamadan from "../components/HeroRamadan"

const Home = () => {
  return (
    <div>
      {/* home section */}

      <section id='home'>
        <HeroRamadan />
      </section>
      <section id="shop">
        <Offer />
      </section>
      {/* Features section */}
      <section id="features">
        <Features />
      </section>
      <section id="contact">
        <Footer />
      </section>
    </div>
  )
}

export default Home