import React, { useState, useEffect, useRef } from "react";
import LetterStories from "../../components/common/LetterStories";

const About = () => {
    // Dữ liệu đánh giá khách hàng
    const testimonials = [
        {
            name: "Nguyễn Văn A...",
            position: "Giám đốc kỹ thuật",
            comment: "Tôi đã mua nhiều điện thoại từ DSon Mobile và luôn hài lòng với chất lượng sản phẩm và dịch vụ hậu mãi tuyệt vời.",
            avatar: "/avatar1.png"
        },
        {
            name: "Trần Thị B...",
            position: "Nhà thiết kế",
            comment: "Đội ngũ tư vấn rất chuyên nghiệp và am hiểu sản phẩm. Họ giúp tôi chọn được chiếc điện thoại phù hợp nhất với nhu cầu công việc.",
            avatar: "/avatar3.png"
        },
        {
            name: "Lê Văn C...",
            position: "Sinh viên",
            comment: "Giá cả hợp lý mà chất lượng lại tốt. Chính sách bảo hành 24 tháng là điểm khiến tôi tin tưởng DSon Mobile.",
            avatar: "/avatar2.png"
        }
    ];

    // Dữ liệu điểm mạnh
    const strengths = [
        {
            title: "Sản phẩm chính hãng",
            description: "100% sản phẩm được nhập khẩu trực tiếp từ nhà sản xuất với giấy tờ đầy đủ.",
            icon: "shield-check"
        },
        {
            title: "Bảo hành 24 tháng",
            description: "Chính sách bảo hành dài nhất thị trường, 1 đổi 1 trong 30 ngày đầu tiên.",
            icon: "refresh"
        },
        {
            title: "Tư vấn chuyên sâu",
            description: "Đội ngũ tư vấn được đào tạo bài bản, am hiểu sản phẩm và công nghệ.",
            icon: "users"
        },
        {
            title: "Hậu mãi tận tâm",
            description: "Hỗ trợ kỹ thuật 24/7, sửa chữa nhanh chóng và chuyên nghiệp.",
            icon: "headset"
        }
    ];

    // Dữ liệu thống kê
    const stats = [
        { value: "10+", label: "Năm kinh nghiệm" },
        { value: "500,000+", label: "Khách hàng" },
        { value: "100%", label: "Hài lòng" },
        { value: "5", label: "Chi nhánh" }
    ];

    // Dữ liệu cửa hàng
    const stores = [
        {
            id: 1,
            name: "DSon Mobile Hà Nội",
            address: "Số 8, Ngõ 134 Cầu Diễn, Bắc Từ Liêm, Hà Nội",
            phone: "024 1234 5678",
            hours: "8:30 - 22:00",
            position: { lat: 21.027763, lng: 105.834160 }
        },
        {
            id: 2,
            name: "Phone Store Hồ Chí Minh",
            address: "456 Nguyễn Văn Linh, Quận 7, TP.HCM",
            phone: "028 8765 4321",
            hours: "8:00 - 21:30",
            position: { lat: 10.732086, lng: 106.722595 }
        }
    ];

    // Icon component đơn giản
    const Icon = ({ name }) => {
        switch (name) {
            case "shield-check":
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case "refresh":
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                );
            case "users":
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                );
            case "headset":
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <main className="bg-white text-gray-800 w-full">

            {/* Câu chuyện thương hiệu */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
                        <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                            <img
                                src="/cua_hang_off.png"
                                alt="Phone Store cửa hàng"
                                className="rounded-xl shadow-lg w-full h-auto object-cover"
                                style={{ aspectRatio: "4/3" }}
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold mb-6 text-black">Câu chuyện của chúng tôi</h2>
                            <div className="w-20 h-1 bg-black mb-6"></div>
                            <p className="text-gray-700 mb-4">
                                DSon Mobile được thành lập vào năm 2013 bởi những chuyên gia đam mê công nghệ với mong muốn mang đến cho người dùng Việt Nam những sản phẩm công nghệ chính hãng với mức giá hợp lý nhất.
                            </p>
                            <p className="text-gray-700 mb-4">
                                Từ một cửa hàng nhỏ tại Hà Nội, chúng tôi đã phát triển thành chuỗi 5 cửa hàng trên toàn quốc, phục vụ hơn 50,000 khách hàng mỗi năm.
                            </p>
                            <p className="text-gray-700 mb-6">
                                Sứ mệnh của chúng tôi là đem đến trải nghiệm công nghệ tiên tiến nhất với dịch vụ chuyên nghiệp nhất cho mọi người dùng Việt Nam.
                            </p>
                            <div className="flex items-center">
                                <div className="mr-8">
                                    <p className="text-4xl font-bold text-black">10+</p>
                                    <p className="text-gray-600">Năm kinh nghiệm</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold text-black">50K+</p>
                                    <p className="text-gray-600">Khách hàng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Các điểm mạnh */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-black">Điểm khác biệt của chúng tôi</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Tại DSon Mobile, chúng tôi luôn đặt lợi ích khách hàng lên hàng đầu với những chính sách và dịch vụ tốt nhất thị trường.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {strengths.map((strength, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-4">
                                    <Icon name={strength.icon} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-black">{strength.title}</h3>
                                <p className="text-gray-600">{strength.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video giới thiệu */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-black">Khám phá DSon Mobile</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Tham quan không gian cửa hàng hiện đại và trải nghiệm dịch vụ chuyên nghiệp của chúng tôi.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-xl">
                            {/* Đây sẽ là video YouTube nhúng */}
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src="https://www.youtube.com/embed/nJSIGox9CtU"
                                title="Phone Store Giới thiệu"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            <LetterStories />

            {/* Thống kê ấn tượng */}
            <section className="py-16 bg-black text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index}>
                                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                                <p className="text-gray-300">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Đánh giá khách hàng */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-black">Khách hàng nói gì về chúng tôi</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Niềm tin và sự hài lòng của khách hàng là thước đo thành công của chúng tôi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-black">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500">{testimonial.position}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                                <div className="mt-4 flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-black">Hệ thống cửa hàng của chúng tôi</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Ghé thăm cửa hàng của chúng tôi để trải nghiệm sản phẩm trực tiếp và nhận tư vấn từ chuyên gia.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        <div className="bg-gray-50 rounded-xl shadow-lg overflow-hidden">
                            {/* Bản đồ - Sử dụng Google Maps Embed API */}
                            <iframe
                                className="w-full h-96 border-0"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBneCTt2fRooMqYbPDqx1Bu6VdIUNTQ19E&q=Số+8,+ngõ+134,+Cầu+Diễn,+Hà+Nội`}
                                allowFullScreen
                                loading="lazy"
                                title="Phone Store Locations"
                            ></iframe>
                        </div>

                        <div className="space-y-6">
                            {stores.map(store => (
                                <div key={store.id} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold mb-2 text-black">{store.name}</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <p className="flex items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{store.address}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {store.phone}
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {store.hours}
                                        </p>
                                    </div>
                                    <button className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                        Chỉ đường
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Kết nối và hành động - Thêm liên kết tư vấn */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-gray-100 rounded-2xl shadow-lg p-10 text-center">
                        <h2 className="text-3xl font-bold mb-4 text-black">Sẵn sàng trải nghiệm?</h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Ghé thăm cửa hàng của chúng tôi ngay hôm nay để được tư vấn miễn phí và trải nghiệm những sản phẩm công nghệ mới nhất.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/"
                                className="bg-black text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                Xem cửa hàng
                            </a>
                            <a
                                href="https://zalo.me/0585068096?message=Chào%20DSon%20Mobile,%20tôi%20muốn%20được%20tư%20vấn%20điện%20thoại."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-black px-8 py-3 rounded-full text-lg font-medium border-2 border-black hover:bg-gray-100 transition-colors"
                            >
                                Liên hệ tư vấn qua Zalo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chứng nhận */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-wrap justify-center items-center gap-10">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-700">Đại lý ủy quyền chính thức</span>
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span className="text-gray-700">Chứng nhận ISO 9001:2015</span>
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-gray-700">Thanh toán an toàn</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default About;