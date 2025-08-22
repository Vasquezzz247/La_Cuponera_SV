import React from 'react';
import Navbar from '../components/Navgation/Navbar';
import Hero from '../components/Hero/Hero';
import FeaturesSection from '../components/FeaturesSection/FeaturesSection';
import FeaturedOffersSection from '@/components/FeaturedOffersSection/FeaturedOffersSection';
import CTASection from '@/components/CTASection/CTASection';
import Footer from '@/components/Footer/Footer';

const Landing: React.FC = () => {
    return (
        <main>
            <Navbar />
            <Hero />
            <FeaturesSection />
            <FeaturedOffersSection />
            <CTASection />
            <Footer />
        </main>
    );
};

export default Landing;