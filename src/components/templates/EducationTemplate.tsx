"use client";

import { TemplateProps } from "./types";
import { Button, Input, Textarea } from "@/components/ui";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Send,
  Star,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle,
  Play,
  ArrowRight,
} from "lucide-react";

export function EducationTemplate({
  site,
  business,
  products,
  formState,
  formData,
  onFormChange,
  onFormSubmit,
}: TemplateProps) {
  const hasProducts = products && products.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Education Style */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${business.primaryColor} 0%, ${business.secondaryColor} 100%)`,
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          {/* Floating Icons */}
          <div className="absolute top-32 left-20 animate-bounce">
            <BookOpen className="w-12 h-12 text-white/20" />
          </div>
          <div className="absolute top-48 right-32 animate-bounce delay-500">
            <GraduationCap className="w-16 h-16 text-white/20" />
          </div>
          <div className="absolute bottom-48 left-32 animate-bounce delay-700">
            <Award className="w-10 h-10 text-white/20" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-white text-sm mb-6">
                <GraduationCap className="w-4 h-4" />
                Transform Your Future
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                {site.headline}
              </h1>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                {site.subheadline || business.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href="#courses"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <BookOpen className="w-5 h-5" />
                  Explore Courses
                </a>
                {business.calendlyUrl ? (
                  <a
                    href={business.calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Consultation
                  </a>
                ) : (
                  <a
                    href="#contact"
                    className="px-8 py-4 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Get Started
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-white">10K+</div>
                  <div className="text-white/60">Students</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">50+</div>
                  <div className="text-white/60">Courses</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">95%</div>
                  <div className="text-white/60">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Card */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-8">
                {business.heroImage ? (
                  <img
                    src={business.heroImage}
                    alt={business.name}
                    className="w-full h-80 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-80 bg-linear-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <GraduationCap className="w-24 h-24 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70 text-lg">{business.name}</p>
                    </div>
                  </div>
                )}
                
                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Certified</div>
                      <div className="text-sm text-gray-500">Programs</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Expert</div>
                      <div className="text-sm text-gray-500">Instructors</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {site.features && site.features.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">Why Choose Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Learn With The Best
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We provide world-class education with innovative teaching methods and personalized support.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {site.features.slice(0, 4).map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {idx === 0 && <BookOpen className="w-7 h-7 text-white" />}
                    {idx === 1 && <Users className="w-7 h-7 text-white" />}
                    {idx === 2 && <Award className="w-7 h-7 text-white" />}
                    {idx === 3 && <GraduationCap className="w-7 h-7 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses Section */}
      {hasProducts && (
        <section id="courses" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">Our Programs</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Courses
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    {course.category && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                        {course.category}
                      </div>
                    )}
                    {course.featured && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>8 Weeks</span>
                      </div>
                      {course.price && (
                        <div className="text-lg font-bold text-indigo-600">
                          ${course.price}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {(business.description || site.aboutText) && (
        <section className="py-24 bg-linear-to-br from-indigo-600 to-purple-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-indigo-200 font-semibold uppercase tracking-wider mb-2">About Us</p>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Empowering Learners Worldwide
                </h2>
                <p className="text-indigo-100 text-lg leading-relaxed mb-8">
                  {business.description || site.aboutText}
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:gap-4 transition-all"
                >
                  Learn More <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">10K+</div>
                  <div className="text-indigo-200">Students Enrolled</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">50+</div>
                  <div className="text-indigo-200">Expert Instructors</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">100+</div>
                  <div className="text-indigo-200">Courses Available</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">95%</div>
                  <div className="text-indigo-200">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {site.testimonials && site.testimonials.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">Student Stories</p>
              <h2 className="text-4xl font-bold text-gray-900">What Our Students Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {site.testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl shadow-sm"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">Student</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">Contact Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Start Your Learning Journey
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Have questions? We're here to help you find the perfect course and support your educational goals.
              </p>

              <div className="space-y-6">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-indigo-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 group-hover:bg-indigo-500 flex items-center justify-center transition-colors">
                      <Phone className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Call Us</div>
                      <div className="font-semibold text-lg">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 text-gray-700 hover:text-indigo-600 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 group-hover:bg-indigo-500 flex items-center justify-center transition-colors">
                      <Mail className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email Us</div>
                      <div className="font-semibold text-lg">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Visit Us</div>
                      <div className="font-semibold text-lg">{business.address}{business.city ? `, ${business.city}` : ""}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {business.socialLinks && (
                <div className="mt-8 flex gap-4">
                  {business.socialLinks.youtube && (
                    <a
                      href={business.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks.instagram && (
                    <a
                      href={business.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {business.socialLinks.facebook && (
                    <a
                      href={business.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-10 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
              <form onSubmit={onFormSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-indigo-400 rounded-lg"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                    required
                    className="bg-white border-gray-200 focus:border-indigo-400 rounded-lg"
                  />
                </div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                  className="bg-white border-gray-200 focus:border-indigo-400 rounded-lg"
                />
                <Textarea
                  placeholder="What courses are you interested in?"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => onFormChange({ ...formData, message: e.target.value })}
                  className="bg-white border-gray-200 focus:border-indigo-400 rounded-lg"
                />
                <Button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-lg font-semibold"
                >
                  {formState === "loading" ? (
                    "Sending..."
                  ) : formState === "success" ? (
                    "Message Sent! ✓"
                  ) : (
                    <>
                      <Send className="w-5 h-5 inline mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                {formState === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-lg object-contain bg-white p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold">{business.name}</span>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
              <p className="mt-1">
                Powered by{" "}
                <a href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Hack Squad
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
