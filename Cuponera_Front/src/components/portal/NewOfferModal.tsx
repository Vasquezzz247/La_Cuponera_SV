import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";

type NewOfferModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
};

export default function NewOfferModal({ open, onClose, onSubmit }: NewOfferModalProps) {
    const [title, setTitle] = useState("");
    const [regularPrice, setRegularPrice] = useState<number | string>("");
    const [offerPrice, setOfferPrice] = useState<number | string>("");
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [redeemBy, setRedeemBy] = useState("");
    const [quantity, setQuantity] = useState<number | string>("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    // calcular descuento
    const discount =
        regularPrice && offerPrice
            ? Math.round(((Number(regularPrice) - Number(offerPrice)) / Number(regularPrice)) * 100)
            : 0;

    function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);

            const form = new FormData();
            form.append("title", title);
            form.append("regular_price", String(regularPrice));
            form.append("offer_price", String(offerPrice));
            form.append("starts_at", startsAt);
            form.append("ends_at", endsAt);
            form.append("redeem_by", redeemBy);
            form.append("quantity", String(quantity));
            form.append("description", description);
            form.append("status", "available");
            form.append("discount_percent", String(discount));
            if (image) form.append("image", image);

            await onSubmit(form);
            onClose();
        } catch (err) {
            console.error("Error guardando cupón:", err);
            alert("Error guardando el cupón.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full p-2 text-gray-500 hover:bg-gray-100"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="mb-4 text-xl font-semibold text-gray-900">Nuevo Cupón</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Precio normal ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={regularPrice}
                                onChange={(e) => setRegularPrice(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Precio oferta ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            {discount > 0 && (
                                <p className="mt-1 text-sm text-emerald-600 font-semibold">
                                    Descuento automático: {discount}%
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Inicio</label>
                            <input
                                type="date"
                                value={startsAt}
                                onChange={(e) => setStartsAt(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fin</label>
                            <input
                                type="date"
                                value={endsAt}
                                onChange={(e) => setEndsAt(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Canjeable hasta</label>
                            <input
                                type="date"
                                value={redeemBy}
                                onChange={(e) => setRedeemBy(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                            <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Imagen</label>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-1 w-full text-sm text-gray-700"
                            />
                            {preview && (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="mt-2 h-24 w-full rounded-lg object-cover border"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            required
                            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Cupón"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
