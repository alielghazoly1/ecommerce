import Features from "../components/Features"
import Hero from "../components/Hero"
import Offer from "../components/Offer"
import Footer from "../components/Footer"

const Home = () => {
  return (
    <div>
      {/* home section */}
      <section id='home'>
        <Hero />
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