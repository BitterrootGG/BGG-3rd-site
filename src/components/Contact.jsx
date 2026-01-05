import QuoteCalculator from "./QuoteCalculator"

const Contact = () => (
  <section
    id="quote"
    className="relative z-10 py-20 bg-forest-dark"
    style={{
      backgroundColor: "#0f1d14",
      backgroundImage:
        "linear-gradient(rgba(11,18,14,0.9), rgba(11,18,14,0.9)), url('/images/forest-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
      <QuoteCalculator />
    </div>
  </section>
)

export default Contact
