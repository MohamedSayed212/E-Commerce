import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const contactInfo = [
  {
    title: "Phone",
    value: "123456789",
    icon: FaPhoneAlt,
  },
  {
    title: "Email",
    value: "support@ecommerce.com",
    icon: FaEnvelope,
  },
  {
    title: "Address",
    value: "USA, California",
    icon: FaMapMarkerAlt,
  },
];

function Contact() {
  // Same dark mode idea as About: "dark:" classes match the site theme from the header.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Keep form fields controlled so values are easy to validate or send later.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (isSubmitted) setIsSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo behavior for now: show success and reset fields.
    setIsSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <main className="sm:container h-[800px] px-6 pb-14">
      {/* Header text */}
      <section className="rounded-2xl bg-white p-6 shadow-sm  md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Contact
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 ">
          We would love to hear from you
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600 ">
          Questions about products, orders, or returns? Send us a message and
          our support team will get back to you as soon as possible.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Contact details */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ">
          <h2 className="text-2xl font-semibold text-gray-900 ">
            Contact Information
          </h2>
          <div className="mt-5 space-y-4">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 ">
                      {item.title}
                    </p>
                    <p className="text-base font-medium text-gray-800 ">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 ">
            Send a Message
          </h2>
          <div className="mt-5 space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary "
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              required
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary "
            />
          </div>
          <button
            type="submit"
            className="mt-5 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover"
          >
            Send Message
          </button>

          {isSubmitted && (
            <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Thanks! Your message has been sent successfully.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

export default Contact;
