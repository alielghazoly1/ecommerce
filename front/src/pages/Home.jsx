import React from 'react'
// import Categories from "../components/Categories"
import Features from "../components/Features"
import Hero from "../components/Hero"
import Offer from "../components/Offer"
import Footer from "../components/Footer"
const Home = () => {
  return (
    <div style={{marginTop:"50px"}}>
      {/* home section */}
      <section id='home'>
        <Hero />
      </section>
      <section id="shop">
        <Offer />
      </section>
      {/*Features section  */}
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
