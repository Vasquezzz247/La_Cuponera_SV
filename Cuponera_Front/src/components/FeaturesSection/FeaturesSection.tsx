import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Gift, Percent, ShoppingBag } from "lucide-react";
import "./FeaturesSection.css";

interface Feature {
    icon: React.ElementType;
    title: string;
    description: string;
}

interface FeaturesSectionProps {
    features?: Feature[];
}

const defaultFeatures: Feature[] = [
    {
        icon: Gift,
        title: "Cupones Exclusivos",
        description: "Accede a descuentos únicos en tus tiendas favoritas.",
    },
    {
        icon: Percent,
        title: "Ofertas Actualizadas",
        description: "Promociones que cambian cada semana para que nunca te pierdas nada.",
    },
    {
        icon: ShoppingBag,
        title: "Compras Inteligentes",
        description: "Ahorra mientras disfrutas de tus marcas preferidas.",
    },
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features = defaultFeatures }) => {
    return (
        <section className="features-section">
            <div className="features-container">
                <div className="features-header">
                    <h2 className="features-title">¿Por qué elegir La Cuponera SV?</h2>
                    <p className="features-subtitle">
                        La plataforma líder en cupones y ofertas de El Salvador
                    </p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="feature-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardHeader>
                                <div className="feature-icon-wrapper">
                                    <feature.icon className="feature-icon" />
                                </div>
                                <CardTitle className="feature-title">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="feature-description">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
