
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import apiCategory from "../../api/apiCategory";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart, Check } from "lucide-react";
import AppContext from "../../context/AppContext";
import ProductCard from "../../components/product/ProductCard";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/toast-custom.css";

const CategoryProducts = () => {
    const { id } = useParams();
    const { setCartCounter } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categories = await apiCategory.getAllCategories();
                const category = categories.find((cat) => cat.id === parseInt(id));
                setCategoryName(category?.name || "Danh mục không xác định");

                const productsData = await apiCategory.getProductsByCategoryId(id);
                setProducts(Array.isArray(productsData) ? productsData : []);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                toast.error("Không thể tải sản phẩm, vui lòng thử lại!", { autoClose: 2000 });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
    };

    const handleAddToCart = (product) => {
        toast(
            <div className="flex items-center w-full p-2 bg-gray-900 border-2 border-[#00ffcc] rounded-lg shadow-[0_0_10px_#00ffcc]">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <ShoppingCart className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-white">
                    {`${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`}
                </span>
            </div>,
            {
                autoClose: 1500,
                position: "top-center",
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                className: "toast-custom",
                bodyClassName: "toast-body-custom",
            }
        );

        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = existingCart.find((item) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            existingCart.push({
                id: product.id,
                quantity: 1,
                name: product.name || "Sản phẩm không tên",
                price: product.sellingPrice || 0,
                images: product.images || [],
            });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        const totalItems = existingCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCounter(totalItems);
    };

    const handleBuyNow = (product) => {
        handleAddToCart(product);
        setTimeout(() => (window.location.href = "/cart"), 1600);
    };

    if (loading) return <div className="text-white text-center">Đang tải...</div>;

    return (
        <div className="p-4 sm:p-6 bg-white text-gray-800 font-lato min-h-screen">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Sản phẩm hãng: {categoryName}
            </h1>
            {products.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {products.map((product) => (
                        <li key={product.id} className="h-[480px]">
                            <ProductCard
                                product={product}
                                handleAddToCart={handleAddToCart}
                                handleBuyNow={handleBuyNow}
                                formatPrice={formatPrice}
                            />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-400">Không có sản phẩm nào trong danh mục này.</p>
            )}
            <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar
                closeOnClick
                pauseOnHover
                theme="dark"
                className="toast-container-custom"
            />
        </div>
    );
};

export default CategoryProducts;
