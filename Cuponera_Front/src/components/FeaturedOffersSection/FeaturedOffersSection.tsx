import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import OfferCard from "../OfferCard/OfferCard"
import "./FeaturedOffersSection.css"

// test data
const featuredOffers = [
    {
        id: 1,
        title: "Cena Romántica para Dos",
        company: "Restaurante El Buen Sabor",
        image: "https://picsum.photos/id/29/500/300",
        discount: 50,
        category: "Restaurantes",
        discountPrice: 22.5,
        originalPrice: 45,
        rating: 4.8,
        reviews: 124,
        location: "San Salvador",
        timeLeft: "2 días",
    },
    {
        id: 2,
        title: "Spa Relajante - Masaje Completo",
        company: "Zen Spa & Wellness",
        image: "https://picsum.photos/id/102/500/300",
        discount: 50,
        category: "Bienestar",
        discountPrice: 40,
        originalPrice: 80,
        rating: 4.9,
        reviews: 89,
        location: "Santa Tecla",
        timeLeft: "5 días",
    },
    {
        id: 3,
        title: "Aventura en Canopy",
        company: "Aventuras Extremas SV",
        image: "",
        discount: 40,
        category: "Aventura",
        discountPrice: 21,
        originalPrice: 35,
        rating: 4.7,
        reviews: 156,
        location: "La Libertad",
        timeLeft: "1 semana",
    },
    {
        id: 4,
        title: "Corte y Peinado Premium",
        company: "Salón Belleza Total",
        image: "https://picsum.photos/id/1074/500/300",
        discount: 50,
        category: "Belleza",
        discountPrice: 12.5,
        originalPrice: 25,
        rating: 4.6,
        reviews: 203,
        location: "San Salvador",
        timeLeft: "3 días",
    },
    {
        id: 5,
        title: "Corte y Peinado Premium",
        company: "Salón Belleza Total",
        image: "https://picsum.photos/id/1074/500/300",
        discount: 50,
        category: "Belleza",
        discountPrice: 12.5,
        originalPrice: 25,
        rating: 4.6,
        reviews: 203,
        location: "San Salvador",
        timeLeft: "3 días",
    },
    {
        id: 6,
        title: "Corte y Peinado Premium",
        company: "Salón Belleza Total",
        image: "https://picsum.photos/id/1074/500/300",
        discount: 50,
        category: "Belleza",
        discountPrice: 12.5,
        originalPrice: 25,
        rating: 4.6,
        reviews: 203,
        location: "San Salvador",
        timeLeft: "3 días",
    },
    {
        id: 7,
        title: "Corte y Peinado Premium",
        company: "Salón Belleza Total",
        image: "https://picsum.photos/id/1074/500/300",
        discount: 50,
        category: "Belleza",
        discountPrice: 12.5,
        originalPrice: 25,
        rating: 4.6,
        reviews: 203,
        location: "San Salvador",
        timeLeft: "3 días",
    },
    {
        id: 8,
        title: "Corte y Peinado Premium",
        company: "Salón Belleza Total",
        image: "https://picsum.photos/id/1074/500/300",
        discount: 50,
        category: "Belleza",
        discountPrice: 12.5,
        originalPrice: 25,
        rating: 4.6,
        reviews: 203,
        location: "San Salvador",
        timeLeft: "3 días",
    },
]


export default function FeaturedOffers() {
    // max 8 offers
    const limitedOffers = featuredOffers.slice(0, 8)

    return (
        <section className="featured-section">
            <div className="container-responsive">
                {/* Header */}
                <div className="featured-header">
                    <div>
                        <h2 className="featured-title">Ofertas Destacadas</h2>
                        <p className="featured-subtitle">
                            Las mejores ofertas disponibles ahora
                        </p>
                    </div>
                    <Button variant="outline" className="see-all-btn" asChild>
                        <Link to="/ofertas">Ver todas las ofertas</Link>
                    </Button>
                </div>

                {/* Scroll horizontal */}
                <div className="featured-scroll-container">
                    <div className="featured-scroll">
                        {limitedOffers.map((offer, index) => (
                            <OfferCard
                                key={offer.id}
                                offer={offer}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
