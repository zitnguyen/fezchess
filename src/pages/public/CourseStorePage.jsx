import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import { ShoppingCart, PlayCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseStorePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const isParent = user?.role === 'Parent';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.getAll();
                setProducts(res);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleBuy = async (product) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!isParent) {
            alert("Chức năng này dành cho phụ huynh.");
            return;
        }

        if (window.confirm(`Xác nhận mua khóa học: ${product.title} với giá ${product.price.toLocaleString()}đ?`)) {
            try {
                await orderService.create({
                    productId: product._id,
                    amount: product.price,
                    paymentMethod: "Account Balance" 
                });
                alert("Đăng ký thành công! Vui lòng thanh toán chuyển khoản để kích hoạt.");
                navigate('/parent/courses'); 
            } catch (error) {
                alert("Lỗi: " + (error.response?.data?.message || "Không thể đăng ký"));
            }
        }
    };

    return (
        <div style={{background:'#F8F9FA', minHeight:'100vh', paddingBottom:'80px'}}>
             <div style={{background:'var(--brand-blue-dark)', padding:'60px 0 80px', textAlign:'center', color:'white', marginBottom:'-40px'}}>
                  <h1 style={{fontFamily:'var(--font-heading)', fontSize:'40px', marginBottom:'16px'}}>KHO KHÓA HỌC VIDEO</h1>
                  <p style={{fontSize:'18px', opacity:0.9}}>Hệ thống bài giảng online chất lượng cao biên soạn bởi đội ngũ kiện tướng.</p>
             </div>

            <div style={{maxWidth:'1280px', margin:'0 auto', padding:'0 24px'}}>
                {loading ? (
                    <div className="text-center py-12">Đang tải...</div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product._id} className="product-item">
                                <div className="product-thumb-container">
                                    {product.thumbnailUrl ? (
                                        <img src={product.thumbnailUrl} alt={product.title} />
                                    ) : (
                                        <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#1F2937', color:'white'}}>
                                            <PlayCircle size={64} opacity={0.5} />
                                        </div>
                                    )}
                                    <div style={{position:'absolute', top:'10px', right:'10px', background:'var(--brand-yellow)', color:'#333', padding:'4px 12px', borderRadius:'20px', fontWeight:'700', fontSize:'14px', boxShadow:'0 2px 5px rgba(0,0,0,0.2)'}}>
                                        {product.price === 0 ? 'Miễn phí' : `${product.price.toLocaleString()}đ`}
                                    </div>
                                </div>
                                <div className="product-details" style={{textAlign:'left'}}>
                                    <h3 style={{fontSize:'18px', fontWeight:'700', marginBottom:'8px', fontFamily:'var(--font-heading)', height:'44px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>{product.title}</h3>
                                    <p style={{fontSize:'14px', color:'#666', marginBottom:'16px', height:'40px', overflow:'hidden'}}>{product.description || 'Không có mô tả'}</p>
                                    
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #eee', paddingTop:'16px'}}>
                                         <span style={{fontSize:'13px', color:'#888', display:'flex', alignItems:'center', gap:'4px'}}><PlayCircle size={14}/> Video HD</span>
                                         <button 
                                            onClick={() => handleBuy(product)}
                                            style={{background:'var(--brand-blue)', color:'white', border:'none', padding:'8px 16px', borderRadius:'6px', fontWeight:'600', cursor:'pointer', fontSize:'14px'}}
                                        >
                                            {user ? 'Mua ngay' : 'Đăng nhập'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {/* Mock items if empty */}
                         {products.length === 0 && [1,2,3].map(i =>(
                             <div key={i} className="product-item">
                                 <div className="product-thumb-container">
                                     <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#eee'}}>
                                         <span style={{fontSize:'40px'}}>♟️</span>
                                     </div>
                                 </div>
                                 <div className="product-details">
                                     <h3>Khóa học mẫu {i}</h3>
                                     <p>Mô tả ngắn về khóa học này...</p>
                                     <button className="btn-cart" style={{width:'auto', padding:'0 16px'}}>Chi tiết</button>
                                 </div>
                             </div>
                         ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseStorePage;
