import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, ImagePlus, X, AlertTriangle } from "lucide-react";

import { API } from "../config";

const BACKEND_BASE = "https://sakshi-freg-backend.onrender.com";
const LOW_STOCK_THRESHOLD = 10;

// Resolve image URL (relative path → full Cloudinary/Render URL)
const getImageUrl = (image: string | undefined) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${BACKEND_BASE}${image}`;
};

// Inline SVG placeholder — no network request, no infinite loop
const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='%23555'%3E🕯️%3C/text%3E%3C/svg%3E";

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    quantity: number;
    category: string;
    isNewProduct?: boolean;
    isBestseller?: boolean;
}

const emptyForm = () => ({
    title: "",
    description: "",
    price: "",
    category: "",
    quantity: "0",
    images: [] as string[], // Cloudinary URLs
});

const AdminProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/products`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (_) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Multi-image upload to Cloudinary via backend
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remaining = 5 - form.images.length;
        if (remaining <= 0) { toast.error("Max 5 images allowed"); return; }
        const toUpload = files.slice(0, remaining);

        setUploading(true);
        try {
            const fd = new FormData();
            toUpload.forEach((f) => fd.append("images", f));
            const res = await fetch(`${API}/upload/multiple`, { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setForm((prev) => ({ ...prev, images: [...prev.images, ...data.images] }));
            toast.success(`${data.images.length} image(s) uploaded!`);
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (idx: number) => {
        setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.images.length === 0) { toast.error("Please upload at least one image"); return; }

        const payload = {
            title: form.title,
            description: form.description,
            price: Number(form.price),
            quantity: Number(form.quantity),
            category: form.category,
            image: form.images[0], // primary image = first
            images: form.images,
        };

        try {
            const url = editingId ? `${API}/products/${editingId}` : `${API}/products`;
            const res = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            toast.success(editingId ? "Product updated!" : "Product created!");
            setModal(false);
            fetchProducts();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        try {
            await fetch(`${API}/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${user?.token}` } });
            toast.success("Product deleted");
            fetchProducts();
        } catch (_) {
            toast.error("Delete failed");
        }
    };

    const openAdd = () => { setEditingId(null); setForm(emptyForm()); setModal(true); };
    const openEdit = (p: Product) => {
        setEditingId(p._id);
        setForm({
            title: p.title,
            description: p.description,
            price: String(p.price),
            category: p.category || "",
            quantity: String(p.quantity ?? 0),
            images: p.images?.length ? p.images : (p.image ? [p.image] : []),
        });
        setModal(true);
    };

    const stockBadge = (qty: number) => {
        if (qty === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">Out of Stock</span>;
        if (qty < LOW_STOCK_THRESHOLD) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Only {qty} left</span>;
        return <span className="text-white/60 text-sm font-medium">{qty}</span>;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-white">Products</h1>
                    <p className="text-white/40 text-sm mt-0.5">{products.length} total products</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-black rounded-xl text-sm font-semibold hover:bg-yellow-400 transition-all">
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40">No products found</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-5 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Product</th>
                                <th className="px-5 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Price</th>
                                <th className="px-5 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Stock</th>
                                <th className="px-5 py-4 text-white/40 font-medium text-xs uppercase tracking-wider">Category</th>
                                <th className="px-5 py-4 text-white/40 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Image gallery preview */}
                                            <div className="flex -space-x-2">
                                                {(p.images?.length ? p.images : [p.image]).slice(0, 3).map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={getImageUrl(img) || PLACEHOLDER}
                                                        alt={p.title}
                                                        className="w-10 h-10 rounded-lg object-cover bg-white/10 border-2 border-[#0a0a0a]"
                                                        onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = PLACEHOLDER; }}
                                                    />
                                                ))}
                                                {(p.images?.length ?? 0) > 3 && (
                                                    <div className="w-10 h-10 rounded-lg bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-xs text-white/50">
                                                        +{p.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm">{p.title}</p>
                                                <p className="text-white/30 text-xs line-clamp-1 max-w-xs">{p.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-white font-medium">₹{p.price}</td>
                                    <td className="px-5 py-4">{stockBadge(p.quantity ?? 0)}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2.5 py-1 rounded-lg bg-white/8 text-white/60 text-xs">{p.category || "—"}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modal ── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-heading font-bold text-white mb-5">{editingId ? "Edit Product" : "Add New Product"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-white/50 mb-1.5">Title</label>
                                    <input name="title" value={form.title} onChange={handleInputChange} required placeholder="Coffee Bliss Candle" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-1.5">Price (₹)</label>
                                    <input name="price" type="number" min="0" value={form.price} onChange={handleInputChange} required placeholder="699" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-1.5">Quantity (Stock)</label>
                                    <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleInputChange} required placeholder="50" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5">Category</label>
                                <input name="category" value={form.category} onChange={handleInputChange} placeholder="Warm, Floral, Sweet..." className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
                                <textarea name="description" value={form.description} onChange={handleInputChange} rows={3} placeholder="Rich coffee aroma..." className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 resize-none transition-all" />
                            </div>

                            {/* Image upload zone */}
                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-2">
                                    Product Images <span className="text-white/30">({form.images.length}/5)</span>
                                </label>

                                {/* Uploaded image previews */}
                                {form.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {form.images.map((url, i) => (
                                            <div key={i} className="relative group">
                                                <img src={url} alt={`img-${i}`} className="w-16 h-16 rounded-xl object-cover border border-white/10" onError={(e) => { const el = e.target as HTMLImageElement; el.onerror = null; el.src = PLACEHOLDER; }} />
                                                {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-yellow-500 text-black rounded-b-xl font-semibold leading-4">Primary</span>}
                                                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button */}
                                {form.images.length < 5 && (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpg,image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-white/15 text-sm text-white/40 hover:border-yellow-500/50 hover:text-yellow-400 transition-all cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                                        >
                                            {uploading ? (
                                                <><span className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" /> Uploading to Cloudinary...</>
                                            ) : (
                                                <><ImagePlus className="w-4 h-4" /> Click to upload images (up to {5 - form.images.length} more)</>
                                            )}
                                        </label>
                                        <p className="text-[11px] text-white/25 mt-1.5">JPG, PNG, WebP · Max 5MB per image · First image = primary</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={uploading} className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-all disabled:opacity-50">
                                    {editingId ? "Update Product" : "Create Product"}
                                </button>
                                <button type="button" onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
