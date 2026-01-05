import React, { useRef, useEffect } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion, useAnimation, useInView } from "framer-motion";

import "react-vertical-timeline-component/style.min.css";

import { styles } from "../styles";
import { process } from "../constants";
import { SectionWrapper } from "../hoc";

const ProcessCard = ({ process }) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: "#1e3a2a",
        color: "#e5e7eb",
      }}
      contentArrowStyle={{ borderRight: "7px solid #1e3a2a" }}
      iconStyle={{ background: "#4f6f52" }}
      icon={
        <div className="flex justify-center items-center w-full h-full">
          <span className="text-stone-light text-[24px] font-bold">{process.step}</span>
        </div>
      }
    >
      <div>
        <h3 className="text-stone-light text-[24px] font-bold">{process.title}</h3>
        <p className="text-stone-mid text-[16px] font-semibold mt-3" style={{ margin: 0 }}>
          {process.description}
        </p>
      </div>
    </VerticalTimelineElement>
  );
};

const Process = () => {
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
        <p className={`${styles.sectionSubText} text-center`}>How We Work</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate={mainControls}
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        }}
      >
        <h2 className={`${styles.sectionHeadText} text-center`}>Our Work Process</h2>
      </motion.div>

      <div className="mt-20 flex flex-col">
        <VerticalTimeline>
          {process.map((step, index) => (
            <ProcessCard key={`process-${index}`} process={step} />
          ))}
        </VerticalTimeline>
      </div>
    </div>
  );
};

export default SectionWrapper(Process, "process");
