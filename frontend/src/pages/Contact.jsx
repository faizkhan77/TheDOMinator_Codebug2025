import React, { useState } from 'react';
import { Navbar } from '../components';
import styles from '../style';
import emailjs from '@emailjs/browser'

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic (e.g., sending to an API or server)
    emailjs
      .sendForm('service_rvbknul', 'template_qikbkai', e.target, {
        publicKey: 'k9Pt_WGKzhQd7nteq',
      })
      .then(
        () => {
          console.log('SUCCESS!');
        },
        (error) => {
          console.log('FAILED...', error.text);
        },
      );

    alert('Message sent!');
  };

  return (
    <>
      <div className={`${styles.paddingX} ${styles.flexCenter} bg-primary`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>
      <div className="min-h-screen bg-[#00040f] text-white flex flex-col items-center justify-center py-16 px-6">
        <div className="w-full max-w-md p-8 bg-[#00040f] rounded-lg shadow-2xl space-y-6">
          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-[#6556cd]">
            Contact Us
          </h1>
          <p className="text-center text-gray-400 text-lg mb-6">
            We're here to help! Send us a message, and we'll get back to you soon.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-[#555] rounded-md px-4 py-3 text-sm bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#6556cd] focus:outline-none transition"
                placeholder="Your full name"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-[#555] rounded-md px-4 py-3 text-sm bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#6556cd] focus:outline-none transition"
                placeholder="Your email address"
              />
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-[#555] rounded-md px-4 py-3 text-sm bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#6556cd] focus:outline-none transition"
                placeholder="Write your message here"
                rows="5"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#6556cd] text-black rounded-md hover:bg-[#4b49b4] focus:outline-none transition duration-300 font-semibold"
            >
              Send Message
            </button>
          </form>

          {/* Contact Info */}
          <div className="text-center mt-8 space-y-4">
            <h2 className="text-xl font-bold text-[#6556cd]">Contact Information</h2>
            <p className="text-gray-400 text-lg">
              Email: <span className="text-white">faizkhan.net7@gmail.com</span>
            </p>
            <p className="text-gray-400 text-lg">
              Phone: <span className="text-white">+91 7506984906</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
