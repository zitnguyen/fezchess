import React from 'react';
import HeroSection from "../../components/sections/HeroSection";
import CoursesSection from "../../components/sections/CoursesSection";
import TeachersSection from "../../components/sections/TeachersSection";
import TestimonialSection from "../../components/sections/TestimonialSection";
import CTASection from "../../components/sections/CTASection";
import ContactSection from "../../components/sections/ContactSection";
import PageTransition from "../../components/layout/PageTransition";

const HomePage = () => {
  return (
    <PageTransition>
       <HeroSection />
       <CoursesSection />
       <TeachersSection />
       <TestimonialSection />
       <CTASection />
       <ContactSection />
    </PageTransition>
  );
};

export default HomePage;
