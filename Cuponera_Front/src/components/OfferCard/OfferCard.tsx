import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock } from "lucide-react"
import { Link } from "react-router-dom"

type Offer = {
    id: number
    title: string
    company: string
    image: string
    discount: number
    category: string
    discountPrice: number
    originalPrice: number
    rating: number
    reviews: number
    location: string
    timeLeft: string
}

interface OfferCardProps {
    offer: Offer
    style?: React.CSSProperties
}

export default function OfferCard({ offer, style }: OfferCardProps) {
    return (
        <div
            className="offer-card border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
            style={style}
        >
            {/* Image */}
            <div className="offer-img-container">
                {offer.image ? (
                    <img src={offer.image} alt={offer.title} className="offer-img" />
                ) : (
                    <div className="offer-placeholder">No Image</div>
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

            <div className="px-3 pb-3 space-y-3">
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
                <Button className="offer-btn" asChild>
                    <Link to={`/oferta/${offer.id}`}>Ver Oferta</Link>
                </Button>
            </div>
        </div>
    )
}
