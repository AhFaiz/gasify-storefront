
import React, { useEffect, useState } from 'react';
import { ArrowRight, Award, Users, Target, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Company stats
  const stats = [
    { label: 'Years of Experience', value: '15+' },
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Products Sold', value: '250,000+' },
    { label: 'Team Members', value: '120+' },
  ];

  // Team members
  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Alex founded Gasify with a vision to revolutionize the gas industry through quality products and exceptional service.',
    },
    {
      name: 'Sarah Williams',
      role: 'Operations Director',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'With over 10 years in the industry, Sarah ensures our operations run smoothly and efficiently.',
    },
    {
      name: 'David Chen',
      role: 'Technical Lead',
      image: 'https://randomuser.me/api/portraits/men/22.jpg',
      bio: 'David oversees product quality and safety standards, ensuring all gas products meet rigorous specifications.',
    },
    {
      name: 'Layla Rodriguez',
      role: 'Customer Experience Manager',
      image: 'https://randomuser.me/api/portraits/women/63.jpg',
      bio: 'Layla leads our customer service team, focusing on creating exceptional experiences for all Gasify customers.',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/90 to-blue-600/90 text-white py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <h1 
              className={`font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-6 transition-all duration-1000 ease-out ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              About Gasify
            </h1>
            <p 
              className={`text-white/80 text-lg md:text-xl max-w-2xl transition-all duration-1000 delay-200 ease-out ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              We're dedicated to providing safe, reliable, and efficient gas solutions for homes and businesses across Indonesia since 2008.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="section-padding">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div 
              className={`transition-all duration-1000 delay-300 ease-out ${
                loaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <div className="relative">
                <div className="relative z-10 rounded-lg overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1589802757543-6d5f09d88f01?q=80&w=2070" 
                    alt="Gasify headquarters" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 rounded-lg overflow-hidden shadow-lg z-0">
                  <img 
                    src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070" 
                    alt="Gasify operations" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary/90 backdrop-blur-sm text-white py-3 px-5 rounded-lg shadow-lg z-20">
                  <p className="font-display font-semibold">Since 2008</p>
                </div>
              </div>
            </div>
            
            <div 
              className={`transition-all duration-1000 delay-500 ease-out ${
                loaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <h2 className="font-display font-bold text-3xl mb-5">Our Story</h2>
              <p className="text-foreground/80 mb-4">
                Founded in 2008, Gasify began with a simple mission: to provide reliable gas solutions that meet the highest safety standards while delivering exceptional customer service.
              </p>
              <p className="text-foreground/80 mb-4">
                What started as a small operation with just five employees and a single delivery truck has grown into one of Indonesia's leading gas suppliers, serving thousands of residential and commercial customers across the country.
              </p>
              <p className="text-foreground/80 mb-6">
                Throughout our journey, we've remained committed to our core values of safety, reliability, innovation, and customer satisfaction. These principles guide every aspect of our business, from product development to delivery practices.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-all-200"
              >
                Get in touch with us
                <ArrowRight size={18} className="ml-1 transition-transform hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="font-display font-bold text-3xl md:text-4xl text-primary mb-2">{stat.value}</p>
                <p className="text-foreground/70 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Vision & Mission Section */}
      <section className="section-padding">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4">Our Vision & Mission</h2>
            <p className="text-foreground/70">
              We're driven by a clear vision and mission that define our purpose and guide our actions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all-300 p-8 border border-border/50 flex flex-col animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Target size={24} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">Our Vision</h3>
              <p className="text-foreground/80 text-pretty">
                To be Indonesia's most trusted gas provider, recognized for excellence in product quality, service reliability, and customer satisfaction, while setting industry standards for safety and innovation.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all-300 p-8 border border-border/50 flex flex-col animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Users size={24} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">Our Mission</h3>
              <p className="text-foreground/80 text-pretty">
                To deliver safe, reliable, and efficient gas solutions through exceptional service, continuous innovation, and a commitment to environmental responsibility. We strive to improve the quality of life for our customers and communities while creating sustainable value for all stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4">Our Core Values</h2>
            <p className="text-foreground/70">
              These principles guide every decision we make and every action we take
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Shield, 
                title: 'Safety First', 
                description: 'We prioritize safety in all aspects of our operations, from product design to delivery procedures.' 
              },
              { 
                icon: Users, 
                title: 'Customer Focus', 
                description: 'We build lasting relationships by understanding and exceeding customer expectations.' 
              },
              { 
                icon: Award, 
                title: 'Excellence', 
                description: 'We strive for excellence in everything we do, constantly improving our products and services.' 
              },
              { 
                icon: Target, 
                title: 'Integrity', 
                description: 'We conduct business with honesty, transparency, and respect for all stakeholders.' 
              }
            ].map((value, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-xl p-6 text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-foreground/70 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="section-padding bg-gray-50">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-4">Our Leadership Team</h2>
            <p className="text-foreground/70">
              Meet the dedicated professionals who drive our mission forward
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all-300 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-lg">{member.name}</h3>
                  <p className="text-primary/80 text-sm mb-3">{member.role}</p>
                  <p className="text-foreground/70 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="bg-gradient-to-r from-primary/90 to-blue-600/90 rounded-2xl p-8 md:p-12 text-white text-center max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-4">Ready to Experience Gasify?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their gas needs. Discover the Gasify difference today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="bg-white text-primary font-medium px-6 py-3 rounded-lg hover:bg-white/90 transition-all-200"
              >
                Explore Products
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-all-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
