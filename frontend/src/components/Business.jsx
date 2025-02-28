import { features } from "../constants";
import styles, { layout } from "../style";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ icon, title, content, index }) => (
  <div className={`flex flex-row p-6 rounded-[20px] ${index !== features.length - 1 ? "mb-6" : "mb-0"} feature-card`}>
    <div className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimBlue`}>
      <img src={icon} alt="feature-icon" className="w-[50%] h-[50%] object-contain" />
    </div>
    <div className="flex-1 flex flex-col ml-3">
      <h4 className="font-poppins font-semibold text-white text-[18px] leading-[23.4px] mb-1">
        {title}
      </h4>
      <p className="font-poppins font-normal text-dimWhite text-[16px] leading-[24px]">
        {content}
      </p>
    </div>
  </div>
);

const Business = () => {
  const navigate = useNavigate()
  return (

    <section id="features" className={layout.section}>
      <div className={layout.sectionInfo}>
        <h2 className={styles.heading2}>
          Build Your Dream Team, <br className="sm:block hidden" /> Let's Bring Your Ideas to Life.
        </h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Discover the perfect teammates for your hackathon projects or collaborative ventures. Our platform connects you with skilled individuals for every part of the process.
        </p>

        <div onClick={() => navigate("/login")}>
          <Button styles={`mt-10`} />
        </div>

      </div>

      <div className={`${layout.sectionImg} flex-col`}>
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} {...feature} index={index} />
        ))}
      </div>
    </section>
  )
};

export default Business;
