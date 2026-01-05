"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import emailjs from "@emailjs/browser"
import { toast, Toaster } from "react-hot-toast"

import { styles } from "../styles"
import { EarthCanvas } from "./canvas"
import { SectionWrapper } from "../hoc"
import { slideIn } from "../utils/motion"

const Contact = () => {
  const formRef = useRef()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // For now, just show a message - email integration can be added later
    setTimeout(() => {
      setLoading(false)
      toast.success("Thank you for your interest! We'll be in touch soon.")
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      })
    }, 1000)
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden">
        <motion.div
          variants={slideIn("left", "tween", 0.2, 1)}
          className="flex-[0.75] bg-black-100 p-8 rounded-2xl"
        >
          <p className={styles.sectionSubText}>Get in touch</p>
          <h3 className={styles.sectionHeadText}>Request a Quote.</h3>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
            <label className="flex flex-col">
              <span className="text-white font-medium mb-4">Your Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="text-white font-medium mb-4">Your Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
                required
              />
            </label>
            <label className="flex flex-col">
              <span className="text-white font-medium mb-4">Phone Number</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-white font-medium mb-4">Project Details</span>
              <textarea
                rows={7}
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your site conditions, project scope, and any specific requirements..."
                className="bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium"
                required
              />
            </label>

            <button
              type="submit"
              className="bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </motion.div>

        <motion.div variants={slideIn("right", "tween", 0.2, 1)} className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]">
          <EarthCanvas />
        </motion.div>
      </div>
    </>
  )
}

export default SectionWrapper(Contact, "contact")
