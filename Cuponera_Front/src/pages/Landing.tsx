import React from 'react';
import Navbar from '../components/Navgation/Navbar';
import Hero from '../components/Hero/Hero';
import FeaturesSection from '../components/FeaturesSection/FeaturesSection';

const Landing: React.FC = () => {
    return (
        <main>
            <Navbar />
            <Hero />
            <FeaturesSection />
        </main>
    );
};

export default Landing;