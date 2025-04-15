import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AnnouncementBar from "../components/layout/AnnouncementBar";
import ScrollToTop from "../components/common/ScrollToTop";
import SmartChatCenter from "../components/common/SmartChatCenter";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import RandomDiscount from "../components/common/RandomDiscount";
import FallingFlowers from "../components/effects/FallingFlowers";

const CustomerLayout = () => {

    const { auth } = useContext(AppContext);

    return (
        <div className="min-h-screen bg-white w-full flex flex-col relative">
            <FallingFlowers />
            <AnnouncementBar />
            <Header />
            <main className="flex w-full flex-grow">
                <div className="w-full">
                    <Outlet />
                </div>
            </main>
            <Footer />
            <div className="fixed bottom-24 right-5 z-[1001]">
                <RandomDiscount />
            </div>
            <div className="fixed bottom-24 right-5 z-[1000]">
                <SmartChatCenter userId={auth?.id || -1} />
            </div>
            <div className="fixed bottom-24 right-5 z-[1000]">
                <ScrollToTop />
            </div>
        </div>
    );
};

export default CustomerLayout;