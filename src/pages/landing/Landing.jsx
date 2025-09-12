import React from "react";
import { useNavigate } from "react-router-dom"
import { useState } from "react"


const heroSlides = [
  {
    image: "https://res.cloudinary.com/dx9y09tya/image/upload/v1757661490/ChatGPT_Image_Sep_12_2025_12_35_14_PM_eqxwsm.png", // Sunlit community garden with flowers
  },
  {
    image: "https://res.cloudinary.com/dx9y09tya/image/upload/v1757661496/ChatGPT_Image_Sep_12_2025_12_45_59_PM_pojory.png", // People walking in a vibrant, green, clean street
  },
  {
    image: "https://res.cloudinary.com/dx9y09tya/image/upload/v1757661501/ChatGPT_Image_Sep_12_2025_12_41_59_PM_ovg9zz.png", // Family enjoying a sunny day in a city park
  },
  {
    image: "https://res.cloudinary.com/dx9y09tya/image/upload/v1757661452/ChatGPT_Image_Sep_12_2025_12_27_36_PM_kjgm5b.png", // Happy children running in a green field
  },
  {
    image: "https://res.cloudinary.com/dx9y09tya/image/upload/v1757661504/ChatGPT_Image_Sep_12_2025_12_38_34_PM_skeic1.png", // People planting trees in a green area
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const slideCount = heroSlides.length;

  // Auto-slide effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setSlide((prev) => (prev + 1) % slideCount);
        setFade(true);
      }, 300); // fade out duration
    }, 6000);
    return () => clearTimeout(timer);
  }, [slide]);

  const goTo = (idx) => {
    setFade(false);
    setTimeout(() => {
      setSlide(idx);
      setFade(true);
    }, 400);
  };
  const prevSlide = () => goTo((slide - 1 + slideCount) % slideCount);
  const nextSlide = () => goTo((slide + 1) % slideCount);

  return (
    <div className="">
      <header className="bg-white/50 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <div >
                    <img src="icon.png" alt="JanSamadhan Logo" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">JanSamadhan</h1>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <button onClick={()=>navigate("/login")} className="px-4 py-2 border rounded-xl border-orange-600 text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Login
              </button>
              <button onClick={()=>navigate("/register/citizen")} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                Register
              </button>
              <button onClick={()=>navigate("/admin/login")} className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-medium transition-colors">
                Admin
              </button>
              <button onClick={()=>navigate("/staff/login")} className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-medium transition-colors">
                Staff
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => {navigate("/login"); setMobileMenuOpen(false)}}
                  className="px-4 py-2 border rounded-xl border-orange-600 text-gray-700 text-left hover:text-orange-600 transition-colors font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => {navigate("/register/citizen"); setMobileMenuOpen(false)}}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-left"
                >
                  Register
                </button>
                <button 
                  onClick={() => {navigate("/admin/login"); setMobileMenuOpen(false)}}
                  className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-medium transition-colors text-left"
                >
                  Admin
                </button>
                <button 
                  onClick={() => {navigate("/staff/login"); setMobileMenuOpen(false)}}
                  className="px-4 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-medium transition-colors text-left"
                >
                  Staff
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Enhanced Hero Section with Slideshow */}
  <section className="relative min-h-screen h-screen overflow-hidden flex items-center">
          {/* Slideshow background */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-x-hidden">
            <div className="flex transition-transform duration-700 ease-in-out h-full w-full" style={{transform: `translateX(-${slide * 100}vw)`}}>
              {heroSlides.map((s, idx) => (
                <div
                  key={idx}
                  className={`relative flex-shrink-0 w-screen h-full transition-transform duration-700 ease-in-out ${idx === slide ? 'scale-105 z-20' : 'scale-95 z-10'}`}
                  style={{backgroundImage: `url('${s.image}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}
                  aria-hidden={false}
                />
              ))}
            </div>
            {/* Arrows */}
            <button onClick={prevSlide} aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md z-20">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md z-20">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`w-3 h-3 rounded-full border-2 ${slide === idx ? 'bg-orange-600 border-orange-600' : 'bg-white border-gray-400'} transition-all`}
                  aria-label={`Go to slide ${idx+1}`}
                />
              ))}
            </div>
          </div>
          {/* Existing hero content (always visible above slideshow) with strong overlay for readability */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-4xl mx-auto rounded-2xl bg-black/60 backdrop-blur-sm p-4 md:p-8" />
              </div>
              <div className="text-center max-w-4xl mx-auto relative z-10">
                <span className="inline-block mb-4 bg-green-600 text-white border border-green-600/20 text-xs px-3 py-1 md:text-sm md:px-4 md:py-2 rounded-full font-medium">
                  Official Government Platform • झारखंड सरकार की आधिकारिक वेबसाइट
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-lg">Your Voice, Our Priority</h1>
                <p className="text-lg md:text-xl lg:text-2xl text-white mb-4 drop-shadow">आपकी आवाज़, हमारी प्राथमिकता</p>
                <p className="text-base md:text-lg text-white mb-8 md:mb-10 max-w-3xl mx-auto drop-shadow">
                  Report civic issues instantly and track their resolution with complete transparency.
                  <br />
                  <span className="text-sm md:text-base">नागरिक समस्याओं का तुरंत समाधान। अपनी शिकायत दर्ज करें और प्रगति को ट्रैक करें।</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pointer-events-auto">
                  <button onClick={()=>navigate("/login")} className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-orange-600 hover:bg-orange-700 text-white text-base md:text-lg font-semibold rounded-lg shadow-lg transition-colors">
                    Report Issue
                  </button>
                  <button onClick={()=>navigate("/login")}  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-base md:text-lg font-medium rounded-lg transition-colors bg-white/10">
                    Track Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Services • सेवाएं</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">Digital services for citizens of Jharkhand</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="group hover:shadow-xl transition-all duration-300 bg-white rounded-lg border border-gray-200 hover:border-orange-200">
                <div className="p-6 md:p-8 text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Road & Transport</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2">सड़क और परिवहन</p>
                  <p className="text-gray-600 text-xs md:text-sm">Road repairs, traffic lights, parking issues</p>
                </div>
              </div>

              <div className="group hover:shadow-xl transition-all duration-300 bg-white rounded-lg border border-gray-200 hover:border-green-200">
                <div className="p-6 md:p-8 text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Water & Sanitation</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2">जल और स्वच्छता</p>
                  <p className="text-gray-600 text-xs md:text-sm">Water supply, sewage, waste management</p>
                </div>
              </div>

              <div className="group hover:shadow-xl transition-all duration-300 bg-white rounded-lg border border-gray-200 hover:border-orange-200">
                <div className="p-6 md:p-8 text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-orange-200 transition-colors">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Power & Energy</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2">बिजली और ऊर्जा</p>
                  <p className="text-gray-600 text-xs md:text-sm">Power outages, street lights, meter issues</p>
                </div>
              </div>

              <div className="group hover:shadow-xl transition-all duration-300 bg-white rounded-lg border border-gray-200 hover:border-green-200">
                <div className="p-6 md:p-8 text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Community Services</h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-2">सामुदायिक सेवाएं</p>
                  <p className="text-gray-600 text-xs md:text-sm">Parks, schools, hospitals, community centers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Transparent Process
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">Journey from complaint to resolution</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { step: "1", title: "Report", subtitle: "", desc: "Submit your issue" },
                { step: "2", title: "Verification", subtitle: "", desc: "Department review" },
                { step: "3", title: "In Progress", subtitle: "", desc: "Resolution process" },
                { step: "4", title: "Resolution", subtitle: "", desc: "Issue resolved" },
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-2xl font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-6 md:top-8 left-1/2 w-full h-0.5 bg-gray-200 transform translate-x-8"></div>
                  )}
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">{item.subtitle}</p>
                  <p className="text-xs md:text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gradient-to-r from-orange-50 via-green-50 to-orange-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Get Started Today</h2>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
                Be part of Jharkhand's development. Share your issues and be part of the solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button onClick={()=>navigate("/login")} className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-orange-600 hover:bg-orange-700 text-white text-base md:text-lg font-semibold rounded-lg shadow-lg transition-colors">
                  Submit New Complaint
                </button>
                <button onClick={()=>navigate("/login")} className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-base md:text-lg font-medium rounded-lg transition-colors">
                  View Existing Complaints
                </button>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-4 md:mt-6">Secure • Transparent • Fast</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <img src="icon.png" alt="" />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg">JanSamadhan</h3>
                  <p className="text-xs md:text-sm opacity-80">Government of Jharkhand</p>
                </div>
              </div>
              <p className="text-xs md:text-sm opacity-80 mb-3 md:mb-4 max-w-md">
                Official digital platform of Government of Jharkhand for transparent citizen-government communication.
              </p>
              <p className="text-xs opacity-60">
                झारखंड सरकार की आधिकारिक डिजिटल प्लेटफॉर्म। नागरिकों और सरकार के बीच पारदर्शी संवाद。
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Quick Links • त्वरित लिंक</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm opacity-80">
                <li>Chief Minister's Office</li>
                <li>Department Contacts</li>
                <li>Policies & Rules</li>
                <li>RTI Portal</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Support • सहायता</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm opacity-80">
                <li>Help Desk</li>
                <li>FAQ</li>
                <li>Contact Us</li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-6 md:mt-8 pt-4 md:pt-6 text-center">
            <p className="text-xs md:text-sm opacity-60">
              © 2025 Government of Jharkhand • झारखंड सरकार. All rights reserved • सभी अधिकार सुरक्षित.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;