import { card } from "../assets";
import styles, { layout } from "../style";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const CardDeal = () => {
  const navigate = useNavigate()
  return (
    <section className={layout.section}>
      <div className={layout.sectionInfo}>
        <h2 className={styles.heading2}>
          Find the perfect collaborators <br className="sm:block hidden" /> in a few easy steps.
        </h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Whether you're looking for developers, designers, or project managers, our platform simplifies the process of finding the right people for your team. Collaborate, create, and succeed together.
        </p>

        <div onClick={() => navigate("/login")}>
          <Button styles={`mt-10`} />
        </div>
      </div>

      <div className={layout.sectionImg}>
        <div className="relative group">
          <img
            src={card}
            alt="collaboration"
            className="w-[100%] h-[100%] relative z-[5]"
          />

          {/* Hover Text */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs bg-black bg-opacity-70 p-2 rounded">
            Image created by Insiya Rizvi
          </div>
        </div>
      </div>

    </section>
  )
};

export default CardDeal;
