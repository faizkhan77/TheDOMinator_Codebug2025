import styles from "../style";
import { discount, robot } from "../assets";
import GetStarted from "./GetStarted";
import { useNavigate } from "react-router-dom";


const Hero = () => {
  const navigate = useNavigate()
  return (
    <section id="home" className={`flex md:flex-row flex-col ${styles.paddingY}`}>
      {/* Left Section */}
      <div className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}>
        {/* Notification Section */}
        <div className="flex flex-row items-center py-[6px] px-4 bg-blue-500 rounded-[10px] mb-2">
          <img src={discount} alt="discount" className="w-[32px] h-[32px]" />
          <p className={`${styles.paragraph} ml-2`}>
            <span className="text-white">Unite With Experts</span> For{" "}
            <span className="text-white">Hackathons & Projects</span>
          </p>
        </div>

        {/* Main Heading */}
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="flex-1 font-poppins font-semibold ss:text-[72px] text-[52px] text-white ss:leading-[100.8px] leading-[75px]">
            Assemble Your <br className="sm:block hidden" />{" "}
            <span className="text-gradient">Dream Team</span>{" "}
          </h1>
          <div className="ss:flex hidden md:mr-4 mr-0" onClick={() => navigate("/login")}>
            <GetStarted />
          </div>
        </div>

        {/* Subheading */}
        <h1 className="font-poppins font-semibold ss:text-[68px] text-[52px] text-white ss:leading-[100.8px] leading-[75px] w-full">
          Ignite Collaboration.
        </h1>

        {/* Description */}
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Looking for the perfect mix of skills? Our platform connects you with
          like-minded hackers, designers, and developers to bring your ideas to life.
          Whether you're building a project or gearing up for a hackathon, success
          starts with the right team.
        </p>
      </div>

      {/* Right Section */}
      <div className={`flex-1 flex ${styles.flexCenter} md:my-0 my-10 relative`}>
        <div className="relative group">
          <img
            src={robot}
            alt="collaboration"
            className="w-[100%] h-[100%] relative z-[5]"
          />

          {/* Hover Text */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs bg-black bg-opacity-70 p-2 rounded">
            Image created by Insiya Rizvi
          </div>

          {/* Gradient Backgrounds */}
          <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
          <div className="absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40" />
          <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
        </div>
      </div>


      {/* Call to Action for Smaller Screens */}
      <div className={`ss:hidden ${styles.flexCenter}`}>
        <GetStarted />
      </div>
    </section>
  );
};

export default Hero;
