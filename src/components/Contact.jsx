"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import emailjs from "@emailjs/browser"
import { Toaster, toast } from "react-hot-toast"
import Confetti from "react-confetti"
import ReCAPTCHA from "react-google-recaptcha"

import { styles } from "../styles"
import { EarthCanvas } from "./canvas"
import { SectionWrapper } from "../hoc"
import { slideIn } from "../utils/motion"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faComment, faPaperPlane, faSpinner, faPhone } from "@fortawesome/free-solid-svg-icons"

const Contact = () => {
  // Temporarily disabled during rebuild - will restore in Phase 3
  return null
}

export default SectionWrapper(Contact, "contact")
