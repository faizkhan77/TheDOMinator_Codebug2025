import { apple, bill, google } from "../assets";
import styles, { layout } from "../style";

const Billing = () => (
  <section id="product" className={layout.sectionReverse}>
    <div className={layout.sectionImgReverse}>
      <div className="relative group">
        <img
          src={bill}
          alt="collaboration"
          className="w-[100%] h-[100%] relative z-[5]"
        />

        {/* Hover Text */}
        <div className="absolute bottom-2 left-0 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs bg-black bg-opacity-70 p-2 rounded">
          Image created by Insiya Rizvi
        </div>

        {/* Gradient Backgrounds */}
        <div className="absolute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient" />
        <div className="absolute z-[0] w-[50%] h-[50%] -left-1/2 bottom-0 rounded-full pink__gradient" />
      </div>
    </div>

    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>
        Manage Your Team Effortlessly <br className="sm:block hidden" /> and Collaborate with Ease
      </h2>
      <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        Whether you're looking for a designer, developer, or any specific skill set, our platform streamlines team formation and collaboration for hackathons and projects. Find the right members, communicate seamlessly, and build together!
      </p>

      <div className="flex flex-row flex-wrap sm:mt-10 mt-6">
        <img src={apple} alt="apple_store" className="w-[128.86px] h-[42.05px] object-contain mr-5 cursor-pointer" />
        <img src={google} alt="google_play" className="w-[144.17px] h-[43.08px] object-contain cursor-pointer" />
      </div>
    </div>
  </section>
);

export default Billing;
