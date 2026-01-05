import React, { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { styles } from "../styles";
import { serviceArea } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn } from "../utils/motion";

const ServiceArea = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={sectionRef}>
      <motion.div
        initial="hidden"
        animate={mainControls}
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
      >
        <p className={`${styles.sectionSubText} text-center`}>Where We Operate</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate={mainControls}
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
      >
        <h2 className={`${styles.sectionHeadText} text-center`}>Service Area.</h2>
      </motion.div>

      <motion.div
        variants={fadeIn("up", "spring", 0.5, 0.75)}
        className="mt-10"
      >
        <div className="bg-tertiary p-8 rounded-lg max-w-3xl mx-auto">
          <h3 className="text-white text-[24px] font-bold mb-4">{serviceArea.region}</h3>
          <p className="text-secondary text-[18px] leading-relaxed">{serviceArea.description}</p>
        </div>
      </motion.div>

      <motion.div
        variants={fadeIn("up", "spring", 0.7, 0.75)}
        className="mt-8"
      >
        <div className="bg-tertiary p-6 rounded-lg max-w-3xl mx-auto border-l-4 border-purple-500">
          <h4 className="text-white text-[20px] font-bold mb-3">Permits</h4>
          <p className="text-white-100 text-[16px] leading-relaxed mb-4">
            Permit requirements vary by state, county, and city. Property owners are responsible for all permits.
          </p>
          <p className="text-secondary text-[14px] leading-relaxed">
            To determine permit requirements, property owners should contact their local county planning department, 
            road department, or city building office for the jurisdiction where the property is located.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SectionWrapper(ServiceArea, "servicearea");
