import React from 'react';
import { Footer, Navbar } from '../components';
import styles from '../style';
import { moin1, moin2, faiz1, faiz2 } from "../assets";

const About = () => {
  return (
    <>
      <div className={`${styles.paddingX} ${styles.flexCenter} bg-primary relative z-50`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>


      <section className="py-24 relative bg-primary">
        <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
          <div className="w-full justify-start items-center gap-12 grid lg:grid-cols-2 grid-cols-1">
            <div className="w-full justify-center items-start gap-6 grid sm:grid-cols-2 grid-cols-1 lg:order-first order-last">
              <div className="pt-24 lg:justify-center sm:justify-end justify-start items-start gap-2.5 flex">
                <img
                  className="w-64 h-94 rounded-xl object-cover"
                  src={moin2}
                  alt="About Us image"
                />
              </div>
              <img
                className="w-64 h-64 sm:ml-0 ml-auto rounded-xl object-cover"
                src={faiz2}
                alt="About Us image"
              />

            </div>
            <div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
              <div className="w-full flex-col justify-center items-start gap-8 flex">
                <div className="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                  <h2 className="text-white text-4xl font-bold font-manrope leading-normal lg:text-start text-center">
                    Empowering Each Other to Succeed
                  </h2>
                  <p className="text-white text-base font-normal leading-relaxed lg:text-start text-center">
                    The two people behind this project, Mohd Faiz Khan and Moin Nakhwaji, bring over 2 years of experience each in development.
                    They have successfully created 30+ projects together. Their team, "The DOMinator," thrives on collaboration and innovation,
                    ensuring the success of every venture they undertake.
                  </p>
                </div>
                <div className="w-full lg:justify-start justify-center items-center sm:gap-10 gap-5 inline-flex">
                  <div className="flex-col justify-start items-start inline-flex">
                    <h3 className="text-white text-4xl font-bold font-manrope leading-normal">2</h3>
                    <h6 className="text-gray-300 text-base font-normal leading-relaxed">Years of Experience (each)</h6>
                  </div>
                  <div className="flex-col justify-start items-start inline-flex">
                    <h4 className="text-white text-4xl font-bold font-manrope leading-normal">30+</h4>
                    <h6 className="text-gray-300 text-base font-normal leading-relaxed">Successful Projects</h6>
                  </div>
                  <div className="flex-col justify-start items-start inline-flex">
                    <h4 className="text-white text-4xl font-bold font-manrope leading-normal">1</h4>
                    <h6 className="text-gray-300 text-base font-normal leading-relaxed">Dedicated Team ("The DOMinator")</h6>
                  </div>
                </div>
              </div>
              <button className="sm:w-fit w-full px-3.5 py-2 bg-indigo-600 hover:bg-indigo-800 transition-all duration-700 ease-in-out rounded-lg shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] justify-center items-center flex">
                <span className="px-1.5 text-white text-sm font-medium leading-6">Read More</span>
              </button>
            </div>
          </div>
        </div>
      </section>




      <section className="py-16 px-4 bg-primary">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Faiz Section */}
          <div className="flex flex-col md:flex-row items-center md:space-x-8">

            <div className="w-full md:w-2/3 mt-4 md:mt-0 bg-gray-800 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:bg-gray-700 duration-300">
              <h3 className="text-3xl font-semibold text-gray-100">Mohd Faiz Khan</h3>
              <h1 className="text-2xl font-bold text-gray-200 mt-2">Python Developer and AI/ML Engineer</h1>
              <p className="mt-4 text-gray-300">
                I am Mohd Faiz Khan, with 2 years of experience as a Full Stack Developer, mainly using Django and ReactJS. Over the past year, I've ventured into the world of AI/ML and have developed a solid understanding of the core concepts. I have worked on numerous ML and Deep Learning models, integrating them into web applications to solve real-world problems. I am passionate about learning and building innovative solutions.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="https://www.instagram.com/mohd.faiz" target="_blank" className="text-gray-300 hover:text-blue-500 transition duration-300">
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a href="https://github.com/MohdFaizKhan" target="_blank" className="text-gray-300 hover:text-blue-500 transition duration-300">
                  <i className="fab fa-github text-2xl"></i>
                </a>
                <a href="https://www.linkedin.com/in/mohd-faiz-khan" target="_blank" className="text-gray-300 hover:text-blue-500 transition duration-300">
                  <i className="fab fa-linkedin text-2xl"></i>
                </a>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <img className="w-full h-70 object-cover rounded-xl transition-transform transform hover:scale-105" src={faiz1} alt="Mohd Faiz Khan" />
            </div>
          </div>

          {/* Moin Section */}
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            <div className="w-full md:w-1/3">
              <img
                className="w-full h-100 object-cover object-top rounded-xl transition-transform transform hover:scale-105"
                src={moin1}
                alt="Moin Nakhwaji"
              />
            </div>

            <div className="w-full md:w-2/3 mt-4 md:mt-0 bg-gray-800 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:bg-gray-700 duration-300">
              <h3 className="text-3xl font-semibold text-gray-100">Moin Nakhwaji</h3>
              <h1 className="text-2xl font-bold text-gray-200 mt-2">Full Stack Developer (MERN Stack)</h1>
              <p className="mt-4 text-gray-300">
                I am Moin Nakhwaji, a Full Stack Developer with 2 years of experience, primarily working with the MERN Stack. I have also developed a strong proficiency in web design, specifically using TailwindCSS. Over the years, I have worked on various development projects, honing my skills and delivering impactful solutions. My passion for coding and building scalable, efficient applications drives me to continuously learn and grow.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="https://www.instagram.com/moin.nakhwaji" target="_blank" className="text-gray-300 hover:text-blue-500 transition duration-300">
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a href="https://github.com/MoinNakhwaji" target="_blank" className="text-gray-300 hover:text-blue-500 transition duration-300">
                  <i className="fab fa-github text-2xl"></i>
                </a>
                <a href="https://www.linkedin.com/in/moin-nakhwaji" target="_blank" className="text-gray-300 hover:text-blue-500 transition duration-300">
                  <i className="fab fa-linkedin text-2xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>




      <section className="py-24 relative xl:mr-0 lg:mr-5 mr-0 bg-primary">
        <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
          <div className="w-full justify-start items-center xl:gap-12 gap-10 grid lg:grid-cols-2 grid-cols-1">
            {/* Left Section */}
            <div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
              <div className="w-full flex-col justify-center items-start gap-8 flex">
                <div className="flex-col justify-start lg:items-start items-center gap-4 flex">
                  <h6 className="text-gray-200 text-base font-normal leading-relaxed">About Us</h6>
                  <div className="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                    <h2 className="text-indigo-700 text-4xl font-bold font-manrope leading-normal lg:text-start text-center">
                      The Tale of Our Achievement Story
                    </h2>
                    <p className="text-gray-300 text-base font-normal leading-relaxed lg:text-start text-center">
                      This project was originally built for our 2-day Hackathon, held by <strong>SkillMafia</strong>, where we collaborated to create a fully functional solution within a short time frame. The journey was filled with challenges, but our teamwork and perseverance brought us to success. In just 3–4 days, we built an impactful product that demonstrated the power of collaboration.
                    </p>
                  </div>
                </div>

                <div className="w-full flex-col justify-center items-start gap-6 flex">
                  <div className="w-full justify-start items-center gap-8 grid md:grid-cols-2 grid-cols-1">
                    {/* Statistic Cards */}
                    <div className="w-full h-full p-3.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                      <h4 className="text-2xl font-bold font-manrope leading-9">3-4 Days</h4>
                      <p className="text-gray-400 text-base font-normal leading-relaxed">Time Taken to Create</p>
                    </div>
                    <div className="w-full h-full p-3.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                      <h4 className="text-2xl font-bold font-manrope leading-9">40+ Hours</h4>
                      <p className="text-gray-400 text-base font-normal leading-relaxed">Total Hours Spent</p>
                    </div>
                  </div>

                  <div className="w-full h-full justify-start items-center gap-8 grid md:grid-cols-2 grid-cols-1">
                    <div className="w-full p-3.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                      <h4 className="text-2xl font-bold font-manrope leading-9">300-400 Users</h4>
                      <p className="text-gray-400 text-base font-normal leading-relaxed">Users Engaged</p>
                    </div>
                    <div className="w-full h-full p-3.5 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                      <h4 className="text-2xl font-bold font-manrope leading-9">1 Successful Launch</h4>
                      <p className="text-gray-400 text-base font-normal leading-relaxed">Project Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="sm:w-fit w-full group px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] transition-all duration-700 ease-in-out justify-center items-center flex">
                <span className="px-1.5 text-indigo-600 text-sm font-medium leading-6 group-hover:-translate-x-0.5 transition-all duration-700 ease-in-out">Read More</span>
                <svg className="group-hover:translate-x-0.5 transition-all duration-700 ease-in-out" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6.75265 4.49658L11.2528 8.99677L6.75 13.4996" stroke="#4F46E5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Right Section (Image) */}
            <div className="w-full lg:justify-start justify-center items-start flex">
              <div className="sm:w-[564px] w-full sm:h-[646px] h-full sm:bg-gray-100 rounded-3xl sm:border border-gray-200 relative">
                <img className="sm:mt-5 sm:ml-5 w-full h-full rounded-3xl object-cover transition-transform transform hover:scale-105 duration-700 ease-in-out" src="https://pagedone.io/asset/uploads/1717742431.png" alt="About Us Image" />
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Footer />
        </div>
      </div>



    </>
  );
};

export default About;
