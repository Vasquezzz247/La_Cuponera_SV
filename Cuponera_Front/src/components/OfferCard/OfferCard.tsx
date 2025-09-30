import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock } from "lucide-react";
import NoImage1 from "../../assets/NoImage1.png";
import NoImage2 from "../../assets/NoImage2.png";
import "./OfferCard.css";
import OfferQuickView from "@/components/OfferQuickView/OfferQuickView";

type Offer = {
    id: number;
    title: string;
    company: string;
    image: string;
    discount: number;
    category: string;
    discountPrice: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    location: string;
    timeLeft: string;
};

interface OfferCardProps {
    offer: Offer;
    style?: React.CSSProperties;
}

export default function OfferCard({ offer, style }: OfferCardProps) {
    const [open, setOpen] = useState(false);
    const fallbackImages = [NoImage1, NoImage2];
    const randomFallback =
        fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    return (
        <>
            <div
                className="offer-card border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                style={style}
            >
                {/* Image */}
                <div className="offer-img-container relative">
                    {offer.image ? (
                        <img src={offer.image} alt={offer.title} className="offer-img" />
                    ) : (
                        <img src={randomFallback} alt="No disponible" className="offer-img" />
                    )}
                    <Badge className="offer-discount">-{offer.discount}%</Badge>
                    <Badge variant="secondary" className="offer-category">
                        {offer.category}
                    </Badge>
                </div>

                {/* Text */}
                <div className="p-3">
                    <h3 className="offer-title">{offer.title}</h3>
                    <p className="offer-company">{offer.company}</p>
                </div>

                <div className="offer-content">
                    {/* Price + Rating */}
                    <div className="offer-price-rating">
                        <div className="offer-price">
                            <span className="price-discount">${offer.discountPrice}</span>
                            <span className="price-original">${offer.originalPrice}</span>
                        </div>
                        <div className="offer-rating">
                            <Star className="icon-star" />
                            <span>{offer.rating}</span>
                            <span className="reviews">({offer.reviews})</span>
                        </div>
                    </div>

                    {/* Location + Time Posted */}
                    <div className="offer-meta">
                        <div className="flex items-center gap-1">
                            <MapPin className="icon-meta" />
                            <span>{offer.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="icon-meta" />
                            <span>{offer.timeLeft}</span>
                        </div>
                    </div>

                    {/* Button */}
                    <div className="offer-btn-wrapper">
                        <Button
                            className="bg-[#008254] hover:bg-[#2a8f65] text-white font-semibold rounded-lg offer-btn"
                            onClick={() => setOpen(true)}   // 👈 abre modal
                        >
                            Ver Oferta
                        </Button>
                    </div>
                </div>
            </div>

            {open && (
                <OfferQuickView
                    offerId={offer.id}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}