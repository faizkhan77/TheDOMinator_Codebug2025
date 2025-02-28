import styles from "../style";
import { logo } from "../assets";
import { footerLinks, socialMedia } from "../constants";

const Footer = () => (
  <section className={`${styles.flexCenter} ${styles.paddingY} flex-col`}>
    <div className={`${styles.flexStart} md:flex-row flex-col mb-8 w-full`}>
      <div className="flex-[1] flex flex-col justify-start mr-10">
        <div className="relative group">
          <img
            src={logo}
            alt="hoobank"
            className="w-[400px] h-auto object-contain"
          />

          {/* Hover Text on top */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs bg-black bg-opacity-70 p-2 rounded">
            Image created by Insiya Rizvi
          </div>
        </div>

        <p className={`${styles.paragraph} mt-4 max-w-[312px]`}>
          Join and find yourself a good team for Hackathons or create your own team and invite others!
        </p>
      </div>



      <div className="flex-[1.5] w-full flex flex-row justify-between flex-wrap md:mt-0 mt-10">
        {footerLinks.map((footerlink) => (
          <div key={footerlink.title} className={`flex flex-col ss:my-0 my-4 min-w-[150px]`}>
            <h4 className="font-poppins font-medium text-[18px] leading-[27px] text-white">
              {footerlink.title}
            </h4>
            <ul className="list-none mt-4">
              {footerlink.links.map((link, index) => (
                <li
                  key={link.name}
                  className={`font-poppins font-normal text-[16px] leading-[24px] text-dimWhite hover:text-secondary cursor-pointer ${index !== footerlink.links.length - 1 ? "mb-4" : "mb-0"
                    }`}
                >
                  <a href={link.link} target="_blank">
                    {link.name}
                  </a>

                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="w-full flex justify-between items-center md:flex-row flex-col pt-6 border-t-[1px] border-t-[#3F3E45]">
      <p className="font-poppins font-normal text-center text-[18px] leading-[27px] text-white">
        Copyright Ⓒ 2025 HackFusion. Developed and designed by
        <a href="https://faizkhanpy.pythonanywhere.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"> Mohd Faiz Khan </a>
        and
        <a href="https://your-link-for-moin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"> Moin Nakhwaji </a>.
      </p>


      {/* <div className="flex flex-row md:mt-0 mt-6">
        {socialMedia.map((social, index) => (
          <img
            key={social.id}
            src={social.icon}
            alt={social.id}
            className={`w-[21px] h-[21px] object-contain cursor-pointer ${index !== socialMedia.length - 1 ? "mr-6" : "mr-0"
              }`}
            onClick={() => window.open(social.link)}
          />
        ))}
      </div> */}
    </div>
  </section>
);

export default Footer;
